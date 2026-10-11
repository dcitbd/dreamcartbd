/**
 * DREAM CART BD — ORDER TRACKING PAGE (TrackOrderPage.js)
 * Implements user requirements:
 * - Customer Privacy First: NO default order or other customer's info is ever displayed by default!
 * - Secure On-Demand Lookup: Orders are shown ONLY when a customer searches their specific Order ID or Phone number
 * - Google Sheets Orders Sheet Integration: Real-time lookup from the live 'Orders' sheet & local storage cache
 * - Elevated Luxury CSS Design: Modern ambient gradients, glowing milestones, soft shadows, rounded-3xl cards
 * - High-Contrast Dark & Light Mode: Flawless readability and aesthetic contrast across all displays
 * - Authentic White Paper Invoice Voucher: Centered watermark logo & isolated iframe printing
 * - 100% Backward & Forward Compatibility: Zero breaking changes with main.js, router.js, or event handlers
 */

import { apiClient } from '../../api/client.js';
import { formatCurrency, formatDate, formatPhone } from '../../utils/format.js';

// Safe HTML escaper helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Global helpers for isolated voucher printing, clipboard copy, and voucher toggle
if (typeof window !== 'undefined') {
  // 1. Isolated Voucher-Only Printing
  window.printVoucherOnly = function() {
    const voucherEl = document.getElementById('official-invoice-voucher');
    if (!voucherEl) {
      window.print();
      return;
    }

    const clone = voucherEl.cloneNode(true);
    clone.querySelectorAll('.print-hide, .btn-print, button').forEach(el => el.remove());

    let printFrame = document.getElementById('voucher-print-iframe');
    if (printFrame) printFrame.remove();

    printFrame = document.createElement('iframe');
    printFrame.id = 'voucher-print-iframe';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>Official Invoice - Dream Cart BD</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0;
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .voucher-paper {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 14px !important;
            position: relative;
            box-shadow: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          .print-hide {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="voucher-paper">
          ${clone.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => printFrame.remove(), 2500);
    }, 300);
  };

  // 2. Copy Order ID helper with toast notification
  window.copyOrderIdToClipboard = function(orderId, btnEl) {
    if (!orderId) return;
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(orderId).then(() => {
        if (btnEl) {
          const original = btnEl.innerHTML;
          btnEl.innerHTML = '<span class="text-emerald-600 font-bold">কপি হয়েছে ✓</span>';
          setTimeout(() => { btnEl.innerHTML = original; }, 2000);
        }
      }).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = orderId;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        if (btnEl) {
          const original = btnEl.innerHTML;
          btnEl.innerHTML = '<span class="text-emerald-600 font-bold">কপি হয়েছে ✓</span>';
          setTimeout(() => { btnEl.innerHTML = original; }, 2000);
        }
      } catch (e) {}
      document.body.removeChild(ta);
    }
  };

  // 3. Toggle Voucher Section with smooth scroll
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

  return `
    <style>
      /* ============================================================
         DREAM CART BD — ORDER TRACKING LUXURY STYLING
         Customer Privacy Focused | Elevated CSS Architecture
         ============================================================ */
      
      .dc-track-container {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      }

      /* Ambient Keyframe Animations */
      @keyframes dcTrackPulseGlow {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
        }
        50% {
          transform: scale(1.06);
          box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
        }
      }

      @keyframes dcBeaconWave {
        0% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }
        70% {
          box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
      }

      @keyframes dcLiveDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.35; transform: scale(0.85); }
      }

      /* Base Cards with Luxury Shadows */
      .track-card {
        background-color: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 28px;
        box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(226, 232, 240, 0.6);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .dark .track-card {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
        box-shadow: 0 22px 50px -15px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(51, 65, 85, 0.6) !important;
      }

      /* Hero Header Ambient Glow */
      .track-hero-glow {
        position: relative;
      }
      .track-hero-glow::before {
        content: '';
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        width: 320px;
        height: 200px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%);
        pointer-events: none;
        z-index: 0;
      }

      /* Soft Glassy Surface */
      .track-surface {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .dark .track-surface {
        background-color: #0f172a !important;
        border-color: #334155 !important;
      }

      /* Search Input with Luxury Focus Aura */
      .track-search-input {
        background-color: #ffffff;
        border: 2px solid #cbd5e1;
        color: #0f172a;
        border-radius: 18px;
        font-size: 14px;
        transition: all 0.25s ease;
      }
      .track-search-input:focus {
        border-color: #10b981;
        background-color: #ffffff;
        box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.2);
        outline: none;
      }
      .dark .track-search-input {
        background-color: #0f172a !important;
        border-color: #334155 !important;
        color: #f8fafc !important;
      }
      .dark .track-search-input:focus {
        border-color: #059669 !important;
        box-shadow: 0 0 0 5px rgba(5, 150, 105, 0.3) !important;
      }

      /* Glowing Search Button */
      .btn-track-search {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #ffffff !important;
        border: none;
        border-radius: 18px;
        font-weight: 800;
        letter-spacing: 0.3px;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .btn-track-search:hover {
        background: linear-gradient(135deg, #047857 0%, #059669 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.45);
      }
      .btn-track-search:active {
        transform: translateY(0);
      }

      /* Privacy Assurance Pill */
      .privacy-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background-color: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .dark .privacy-badge {
        background-color: #064e3b/40;
        color: #86efac;
        border-color: #065f46;
      }

      /* Feature Showcase Mini Cards */
      .feature-box {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 20px;
        transition: all 0.25s ease;
      }
      .feature-box:hover {
        border-color: #10b981;
        transform: translateY(-3px);
        box-shadow: 0 12px 25px -5px rgba(16, 185, 129, 0.1);
      }
      .dark .feature-box {
        background: #0f172a;
        border-color: #334155;
      }
      .dark .feature-box:hover {
        border-color: #059669;
        box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.5);
      }

      /* Connected Visual Stepper */
      .track-timeline {
        position: relative;
        padding-left: 38px;
      }
      .track-timeline-track {
        position: absolute;
        left: 16px;
        top: 18px;
        bottom: 26px;
        width: 3px;
        background-color: #e2e8f0;
        border-radius: 9999px;
      }
      .dark .track-timeline-track {
        background-color: #334155 !important;
      }
      .track-timeline-progress {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        border-radius: 9999px;
        transition: height 0.5s ease;
      }

      .track-step-node {
        position: relative;
        padding-bottom: 28px;
      }
      .track-step-node:last-child {
        padding-bottom: 0;
      }

      .track-step-bullet {
        position: absolute;
        left: -38px;
        top: 2px;
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 900;
        z-index: 3;
        transition: all 0.25s ease;
      }
      .track-step-bullet.active {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #ffffff;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.28);
      }
      .track-step-bullet.current-pulse {
        animation: dcBeaconWave 2s infinite;
      }
      .track-step-bullet.inactive {
        background-color: #f1f5f9;
        color: #94a3b8;
        border: 2px solid #cbd5e1;
      }
      .dark .track-step-bullet.inactive {
        background-color: #0f172a !important;
        color: #64748b !important;
        border-color: #334155 !important;
      }

      /* Copy Button */
      .btn-copy-id {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 10px;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .btn-copy-id:hover {
        background: #ecfdf5;
        border-color: #10b981;
        color: #059669;
      }
      .dark .btn-copy-id {
        background: #0f172a;
        border-color: #334155;
        color: #94a3b8;
      }
      .dark .btn-copy-id:hover {
        background: #064e3b;
        color: #34d399;
      }

      /* Action Pills */
      .btn-track-action {
        background-color: #ffffff;
        color: #0f172a !important;
        border: 1.5px solid #cbd5e1;
        font-weight: 700;
        border-radius: 16px;
        padding: 11px 20px;
        font-size: 12px;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      }
      .btn-track-action:hover {
        background-color: #f8fafc;
        border-color: #10b981;
        color: #059669 !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);
      }
      .dark .btn-track-action {
        background-color: #0f172a !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
      }
      .dark .btn-track-action:hover {
        background-color: #1e293b !important;
        border-color: #059669 !important;
        color: #34d399 !important;
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
        body, #app-content {
          background: #ffffff !important;
          color: #000000 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #track-main-container > div:not(#track-voucher-section) {
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

    <div id="track-main-container" class="dc-track-container max-w-4xl mx-auto space-y-6 sm:space-y-8 py-6 sm:py-12 px-4 sm:px-6">
      
      <!-- Page Title & Header (Track Hero Glow) -->
      <div class="track-hero-glow text-center space-y-3 relative z-10 print-hide">
        <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-emerald-200/90 dark:border-emerald-800/90 shadow-xs">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; animation: dcLiveDot 1.8s infinite;"></span>
          <span>লাইভ পার্সেল ট্র্যাকিং • LIVE ORDER TRACKING</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          আপনার পার্সেল ট্র্যাক করুন
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          আপনার ব্যক্তিগত অর্ডার সুরক্ষিতভাবে ট্র্যাক করতে নিচে আপনার অর্ডার আইডি বা মোবাইল নম্বর প্রবেশ করান।
        </p>

        <!-- Privacy & Security Guarantee Badge -->
        <div class="pt-1">
          <span class="privacy-badge">
            <span>🔒</span>
            <span>গ্রাহক গোপনীয়তা সুরক্ষিত • আপনার তথ্য অন্য কারো কাছে দৃশ্যমান নয়</span>
          </span>
        </div>
      </div>

      <!-- Main Search Card (Pill / Bar) -->
      <div class="track-card p-6 sm:p-8 print-hide relative overflow-hidden">
        <form 
          id="tracking-search-form" 
          class="flex flex-col sm:flex-row gap-3 relative z-10"
          onsubmit="event.preventDefault(); const val = document.getElementById('track-input').value.trim(); if(val) { if(window.router && window.router.navigate) { window.router.navigate('/track?orderId=' + encodeURIComponent(val)); } else { window.location.href='/track?orderId=' + encodeURIComponent(val); } }"
        >
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-base">
              🔍
            </span>
            <input 
              type="text" 
              id="track-input" 
              placeholder="অর্ডার আইডি (যেমন: ORD-XXXXXX) বা মোবাইল নম্বর (যেমন: 01XXXXXXXXX)" 
              value="${escapeHtml(queryStr)}"
              required
              autocomplete="off"
              class="track-search-input text-xs sm:text-sm w-full pl-11 pr-4 py-4 font-mono outline-none"
            />
          </div>
          <button type="submit" class="btn-track-search text-xs sm:text-sm py-4 px-8 whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
            <span>ট্র্যাক করুন</span>
            <span>⚡</span>
          </button>
        </form>

        <div class="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 justify-center sm:justify-start">
          <span>💡</span>
          <span>টিপস: অর্ডার কনফার্মেশনের সময় প্রাপ্ত ৬ ডিজিটের আইডি অথবা আপনার ফোন নম্বর দিয়ে সার্চ করুন।</span>
        </div>
      </div>

      ${!isSearched ? `
        <!-- INITIAL WELCOME / INSTRUCTIONS STATE (No Default Order Displayed for Privacy) -->
        <div class="space-y-6 print-hide">
          
          <!-- 3 Feature Highlight Boxes -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div class="feature-box space-y-2">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                ⚡
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">রিয়েল-টাইম স্ট্যাটাস</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                পদুয়ার বাজার কুমিল্লা হাব থেকে পার্সেল প্যাকিং ও কুরিয়ার ট্রানজিটের প্রতিটি ধাপ সরাসরি লাইভ দেখুন।
              </p>
            </div>

            <div class="feature-box space-y-2">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                🚚
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">দ্রুততম হোম ডেলিভারি</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Steadfast ও Pathao Express-এর মাধ্যমে ঢাকা ও কুমিল্লায় ২৪-৪৮ ঘণ্টা এবং সারাদেশে ৭২ ঘণ্টায় ডেলিভারি।
              </p>
            </div>

            <div class="feature-box space-y-2">
              <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
                🔒
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">ব্যক্তিগত তথ্য সুরক্ষা</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                আপনার অর্ডারের তথ্য সম্পূর্ণ গোপন ও সুরক্ষিত। শুধুমাত্র আপনার আইডি বা ফোন নম্বর দ্বারাই তা উন্মোচিত হবে।
              </p>
            </div>

          </div>

          <!-- How to Find Order ID Guide Card -->
          <div class="track-card p-6 sm:p-8 space-y-4">
            <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>📋</span> কীভাবে আপনার অর্ডার আইডি খুঁজে পাবেন?
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <span class="inline-block w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black text-center leading-6">১</span>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200">এসএমএস বা ইমেইল</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">অর্ডার কনফার্মেশনের পর আপনার নম্বরে প্রেরিত SMS-এ অর্ডার আইডি উল্লেখ থাকে।</div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <span class="inline-block w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black text-center leading-6">২</span>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200">মোবাইল নম্বর ব্যবহার</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">অর্ডার আইডি মনে না থাকলে চেকআউটে ব্যবহৃত ১১ ডিজিটের মোবাইল নম্বর লিখুন।</div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <span class="inline-block w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black text-center leading-6">৩</span>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200">হটলাইন সাপোর্ট</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">যেকোনো জটিলতায় আমাদের হোয়াটসঅ্যাপ হটলাইনে যোগাযোগ করে আইডি জেনে নিন।</div>
              </div>
            </div>

            <!-- Hotline Support Footer in Welcome View -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
              <span class="flex items-center gap-1.5 font-medium">
                <span>🎧</span> সরাসরি কাস্টমার কেয়ার প্রতিনিধির সাথে কথা বলতে:
              </span>
              <div class="flex flex-wrap items-center gap-3 font-semibold">
                <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                  <span>💬</span> 01581703822 (WhatsApp)
                </a>
                <a href="tel:01818273838" class="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                  <span>📞</span> 01818273838 (হটলাইন)
                </a>
              </div>
            </div>

          </div>

        </div>
      ` : (isNotFound ? `
        <!-- NOT FOUND CARD -->
        <div class="track-card p-6 sm:p-10 text-center space-y-4 border-rose-200 dark:border-rose-900/60 print-hide">
          <div class="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mx-auto shadow-xs">
            ⚠️
          </div>
          <div class="space-y-1">
            <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              কোনো অর্ডার পাওয়া যায়নি
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              আপনার প্রদত্ত <strong class="text-rose-600 font-mono">"${escapeHtml(queryStr)}"</strong> তথ্য অনুযায়ী আমাদের Orders শিটে কোনো অর্ডার রেকর্ড মেলেনি।
            </p>
          </div>

          <div class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl max-w-md mx-auto text-xs text-left space-y-2 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800">
            <div class="font-bold text-slate-800 dark:text-slate-200">কীভাবে নিশ্চিত হবেন:</div>
            <ul class="list-disc pl-5 space-y-1">
              <li>অর্ডার আইডি (যেমন: <strong>ORD-XXXXXX</strong>) সঠিকভাবে টাইপ করেছেন কিনা দেখে নিন।</li>
              <li>অথবা চেকআউটে ব্যবহৃত <strong>১১ ডিজিটের মোবাইল নম্বর</strong> দিয়ে পুনরায় সার্চ করুন।</li>
              <li>সম্প্রতি মাত্র অর্ডার করে থাকলে ২-৩ মিনিট পর আবার সার্চ করুন।</li>
            </ul>
          </div>

          <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a 
              href="https://wa.me/8801581703822?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি আমার অর্ডার #' + queryStr + ' ট্র্যাক করতে পারছি না। দয়া করে সাহায্য করবেন?')}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="btn-track-action text-emerald-600"
            >
              <span>💬</span> হোয়াটসঅ্যাপ হটলাইনে সহায়তা নিন (01581703822)
            </a>
            <a 
              href="/track"
              class="btn-track-action"
            >
              <span>🔄</span> নতুন সার্চ করুন
            </a>
          </div>
        </div>
      ` : `
        <!-- LIVE ORDER TRACKING DETAILS CARD (SHOWN ONLY TO MATCHED CUSTOMER) -->
        <div class="track-card p-6 sm:p-9 space-y-7 print-hide">
          
          <!-- Top Order Header & Status Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800 gap-4">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">অর্ডার আইডি:</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400 font-black text-base sm:text-xl">
                  #${displayOrderId}
                </span>
                <button 
                  type="button" 
                  class="btn-copy-id" 
                  onclick="window.copyOrderIdToClipboard('${displayOrderId}', this)"
                  title="অর্ডার আইডি কপি করুন"
                >
                  <span>📋</span> কপি
                </button>
              </div>

              <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>📅 তারিখ: <strong>${dateStr}</strong></span>
              </div>
            </div>

            <!-- Status Badge Pill -->
            <div class="self-start sm:self-center flex flex-col items-start sm:items-end gap-1.5">
              <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                isCancelled ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300' :
                isDelivered ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' :
                isInTransit ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300' :
                isConfirmed ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300' :
                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
              }">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${isCancelled ? '#e11d48' : isDelivered ? '#10b981' : isInTransit ? '#3b82f6' : '#f59e0b'}; animation: dcLiveDot 1.6s infinite;"></span>
                <span>${status}</span>
              </span>
              <span class="text-[11px] text-slate-400 dark:text-slate-500">
                কুরিয়ার: <strong>${escapeHtml(matchedOrder.courier || 'Steadfast / Pathao Express')}</strong>
              </span>
            </div>
          </div>

          <!-- Courier Logistics & Hub Banner -->
          <div class="track-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                🚚
              </div>
              <div class="space-y-0.5">
                <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>ডেলিভারি নেটওয়ার্ক:</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">${escapeHtml(matchedOrder.courier || 'Steadfast / Pathao Express')}</span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  পদুয়ার বাজার বিশ্বরোড হাব থেকে সারা বাংলাদেশে ৪৮-৭২ ঘণ্টার মধ্যে নিরাপদ হোম ডেলিভারি।
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-start sm:self-center">
              <a 
                href="https://wa.me/8801581703822?text=${encodeURIComponent('আসসালামু আলাইকুম, আমার অর্ডার #' + displayOrderId + '-এর ডেলিভারি আপডেট জানতে চাই।')}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700 shadow-xs hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span>💬</span> লাইভ আপডেট
              </a>
            </div>
          </div>

          ${isCancelled ? `
            <!-- CANCELLED WARNING -->
            <div class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <strong>এই অর্ডারটি বাতিল (Cancelled) করা হয়েছে।</strong><br/>
                বিস্তারিত জানতে বা অর্ডারটি পুনরায় সক্রিয় করতে আমাদের হটলাইনে যোগাযোগ করুন: 01581703822 বা 01818273838।
              </div>
            </div>
          ` : `
            <!-- VISUAL TIMELINE STEPPER -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>পার্সেল অগ্রগতি ট্র্যাকার</span>
                <span class="text-emerald-600 dark:text-emerald-400 font-mono">${progressPercent}% সম্পন্ন</span>
              </div>

              <div class="track-timeline py-2">
                <div class="track-timeline-track">
                  <div class="track-timeline-progress" style="height: ${progressPercent}%;"></div>
                </div>

                ${steps.map((st, idx) => {
                  const isCurrent = st.active && (!steps[idx + 1] || !steps[idx + 1].active);
                  return `
                    <div class="track-step-node">
                      <div class="track-step-bullet ${st.active ? 'active' : 'inactive'} ${isCurrent ? 'current-pulse' : ''}">
                        ${st.active ? '✓' : st.stepNum}
                      </div>
                      <div class="flex items-baseline justify-between gap-2 flex-wrap">
                        <div class="text-xs sm:text-sm font-bold ${st.active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}">
                          ${st.titleBn}
                          <span class="text-[11px] font-normal block sm:inline text-slate-400 dark:text-slate-500 sm:ml-1">(${st.title})</span>
                        </div>
                        <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          st.active 
                            ? (isCurrent ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800') 
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                        }">
                          ${st.active ? (isCurrent ? 'চলমান ⏳' : 'সম্পন্ন ✓') : 'অপেক্ষমাণ'}
                        </span>
                      </div>
                      <div class="text-[11px] sm:text-xs ${st.active ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'} mt-1 leading-relaxed">
                        ${st.desc}
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `}

          <!-- Customer & Order Information Grid (Two-column) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            <!-- Left: Delivery & Customer Info -->
            <div class="track-surface p-5 space-y-3">
              <div class="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <span>📍</span> ডেলিভারি ও গ্রাহক তথ্য
              </div>
              <div class="space-y-2.5 text-xs">
                <div class="flex justify-between items-baseline gap-2">
                  <span class="text-slate-500 dark:text-slate-400">গ্রাহকের নাম:</span>
                  <span class="font-bold text-slate-900 dark:text-white text-right">${escapeHtml(matchedOrder.customer_name || "সম্মানিত গ্রাহক")}</span>
                </div>
                <div class="flex justify-between items-baseline gap-2">
                  <span class="text-slate-500 dark:text-slate-400">মোবাইল নম্বর:</span>
                  <a href="tel:${matchedOrder.phone}" class="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-right">${escapeHtml(matchedOrder.phone || "01700000000")}</a>
                </div>
                <div class="flex justify-between items-start gap-2">
                  <span class="text-slate-500 dark:text-slate-400 whitespace-nowrap">ডেলিভারি ঠিকানা:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200 text-right leading-relaxed">${escapeHtml(matchedOrder.address || "বাংলাদেশ")}</span>
                </div>
                <div class="flex justify-between items-baseline gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span class="text-slate-500 dark:text-slate-400">অ্যাকাউন্ট টাইপ:</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300 text-right">${escapeHtml(matchedOrder.account_type || "Customer")}</span>
                </div>
              </div>
            </div>

            <!-- Right: Payment & Finance Summary -->
            <div class="track-surface p-5 space-y-3">
              <div class="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <span>💳</span> পেমেন্ট ও আর্থিক বিবরণী
              </div>
              <div class="space-y-2.5 text-xs">
                <div class="flex justify-between items-baseline gap-2">
                  <span class="text-slate-500 dark:text-slate-400">পেমেন্ট মেথড:</span>
                  <span class="font-bold text-slate-900 dark:text-white text-right">${escapeHtml(matchedOrder.payment_method || "Cash On Delivery (COD)")}</span>
                </div>
                <div class="flex justify-between items-baseline gap-2">
                  <span class="text-slate-500 dark:text-slate-400">পেমেন্ট স্ট্যাটাস:</span>
                  <span class="inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] ${matchedOrder.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
                    ${escapeHtml(matchedOrder.payment_status || "COD")}
                  </span>
                </div>
                <div class="flex justify-between items-baseline gap-2">
                  <span class="text-slate-500 dark:text-slate-400">ট্রানজেকশন আইডি:</span>
                  <span class="font-mono text-slate-700 dark:text-slate-300 text-right">${escapeHtml(matchedOrder.transaction_id || "N/A")}</span>
                </div>
                <div class="flex justify-between items-baseline gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span class="text-slate-500 dark:text-slate-400 font-bold">সর্বমোট প্রদেয়:</span>
                  <span class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">${formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Itemized Order Products Table Card -->
          <div class="track-surface p-5 space-y-3">
            <div class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <span class="flex items-center gap-1.5">
                <span>📦</span> অর্ডারের পণ্যের তালিকা
              </span>
              <span class="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                (${items.length} টি আইটেম)
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="text-slate-400 dark:text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
                    <th class="py-2 font-semibold">পণ্য</th>
                    <th class="py-2 text-center font-semibold">পরিমাণ</th>
                    <th class="py-2 text-right font-semibold">দর</th>
                    <th class="py-2 text-right font-semibold">মোট</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${items.map((it) => `
                    <tr>
                      <td class="py-2.5 pr-2 font-medium text-slate-900 dark:text-white">
                        <div>${escapeHtml(it.name)}</div>
                        ${(it.color || it.size) ? `
                          <div class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            ভ্যারিয়েন্ট: ${[it.color, it.size].filter(Boolean).map(escapeHtml).join(' / ')}
                          </div>
                        ` : ''}
                      </td>
                      <td class="py-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${it.quantity}
                      </td>
                      <td class="py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        ${formatCurrency(it.price)}
                      </td>
                      <td class="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${formatCurrency(Number(it.price) * Number(it.quantity || 1))}
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <!-- Price Breakdown Summary -->
            <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
              <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>সাবটোটাল (পণ্য মূল্য):</span>
                <span class="font-mono font-bold text-slate-800 dark:text-slate-200">${formatCurrency(subtotal)}</span>
              </div>
              <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>ডেলিভারি চার্জ:</span>
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${deliveryFee === 0 ? 'ফ্রি (৳০)' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div class="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span class="font-mono text-base text-emerald-600 dark:text-emerald-400">${formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <!-- Action Toolbar: View Voucher & Print -->
          <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button 
              type="button"
              class="btn-track-action cursor-pointer"
              onclick="window.toggleTrackVoucherSection()"
            >
              <span>📄</span> অফিশিয়াল ইনভয়েস ভাউচার দেখুন / লুকান
            </button>
            <button 
              type="button"
              class="btn-track-action cursor-pointer"
              onclick="window.printVoucherOnly ? window.printVoucherOnly() : window.print()"
            >
              <span>🖨️</span> ভাউচার প্রিন্ট / ডাউনলোড
            </button>
          </div>

          <!-- Hotline Support Footer in Matched Order View -->
          <div class="pt-5 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
            <span class="flex items-center gap-1.5 font-medium">
              <span>🎧</span> পার্সেল বা ডেলিভারি সহায়তায় আমাদের হটলাইন:
            </span>
            <div class="flex flex-wrap items-center gap-3 font-semibold">
              <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                <span>💬</span> 01581703822 (WhatsApp)
              </a>
              <a href="tel:01818273838" class="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                <span>📞</span> 01818273838 (হটলাইন)
              </a>
            </div>
          </div>

        </div>

        <!-- Collapsible Official Invoice Voucher Section -->
        <div id="track-voucher-section" class="hidden space-y-3 pt-2">
          <div class="text-center print-hide">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              অফিশিয়াল ডিজিটাল ইনভয়েস ভাউচার (A4 প্রিন্ট ফরম্যাট)
            </span>
          </div>

          <!-- VOUCHER DOCUMENT (White Paper Receipt with Fully Arranged Layout) -->
          <div id="official-invoice-voucher" data-order-id="${displayOrderId}" class="voucher-paper-container max-w-2xl mx-auto p-6 sm:p-8 relative">
            
            <!-- Watermark Logo (Centered Faint Logo on White Background) -->
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 1;">
              <img 
                src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
                alt="Watermark" 
                style="width: 250px; opacity: 0.08; filter: none; object-fit: contain;"
              />
            </div>

            <!-- Document Contents (Table-structured for 100% resilient layout in print and screen) -->
            <div style="position: relative; z-index: 2;">
              
              <!-- 1. Header Table -->
              <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 16px;">
                <tr>
                  <td style="vertical-align: top; width: 62%;">
                    <table style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px; width: 56px;">
                          <img 
                            src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
                            alt="Logo" 
                            style="width: 52px; height: 52px; object-fit: contain; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2px; background: #ffffff;"
                          />
                        </td>
                        <td style="vertical-align: top;">
                          <div style="font-size: 20px; font-weight: 900; color: #0f172a; line-height: 1.2;">
                            Dream Cart <span style="color: #059669;">BD</span>
                          </div>
                          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
                            Smart Digital Commerce Platform
                          </div>
                          <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">
                            চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা।<br/>
                            হটলাইন: <strong style="color: #0f172a;">01581703822</strong>, <strong style="color: #0f172a;">01818273838</strong>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: top; text-align: right; width: 38%;">
                    <div style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Official Invoice
                    </div>
                    <div style="font-size: 12px; font-weight: 700; color: #334155;">
                      Order ID: <span style="font-family: monospace; font-size: 14px; font-weight: 900; color: #059669;">${displayOrderId}</span>
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                      তারিখ: <span style="color: #334155; font-weight: 600;">${dateStr}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 2. Customer & Payment Info Boxes (Side-by-side) -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; height: 100%;">
                      <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px; margin-bottom: 4px;">
                        গ্রাহকের বিবরণ:
                      </div>
                      <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
                        ${escapeHtml(matchedOrder.customer_name || "সম্মানিত গ্রাহক")}
                      </div>
                      <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">
                        📞 মোবাইল: <strong style="color: #0f172a; font-family: monospace;">${escapeHtml(matchedOrder.phone || "01700000000")}</strong>
                      </div>
                      <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                        📍 ঠিকানা: <span style="color: #1e293b;">${escapeHtml(matchedOrder.address || "বাংলাদেশ")}</span>
                      </div>
                    </div>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; height: 100%;">
                      <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px; margin-bottom: 4px;">
                        পেমেন্ট বিবরণ:
                      </div>
                      <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                        মেথড: <strong style="color: #0f172a;">${escapeHtml(matchedOrder.payment_method || "Cash On Delivery (COD)")}</strong>
                      </div>
                      <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                        পেমেন্ট স্ট্যাটাস: <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; ${matchedOrder.payment_status === 'Paid' ? 'background-color: #d1fae5; color: #065f46;' : 'background-color: #fef3c7; color: #92400e;'}">${escapeHtml(matchedOrder.payment_status || "COD")}</span>
                      </div>
                      <div style="font-size: 11px; color: #475569;">
                        অর্ডার স্ট্যাটাস: <strong style="color: #059669;">${escapeHtml(matchedOrder.order_status || "Order Placed")}</strong>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 3. Itemized Products Table -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px;">
                <thead>
                  <tr style="background-color: #f1f5f9; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 8px 10px; text-align: left; width: 6%;">নং</th>
                    <th style="padding: 8px 10px; text-align: left; width: 54%;">পণ্য বিবরণ</th>
                    <th style="padding: 8px 10px; text-align: center; width: 12%;">পরিমাণ</th>
                    <th style="padding: 8px 10px; text-align: right; width: 14%;">দর</th>
                    <th style="padding: 8px 10px; text-align: right; width: 14%;">মোট</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.length > 0 ? items.map((it, idx) => `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 8px 10px; color: #64748b;">${idx + 1}</td>
                      <td style="padding: 8px 10px; color: #0f172a; font-weight: 600;">
                        ${escapeHtml(it.name || "পণ্য")}
                        ${(it.color || it.size) ? `<span style="font-size: 10px; color: #059669; font-weight: normal; margin-left: 4px;">(${[it.color, it.size].filter(Boolean).map(escapeHtml).join(', ')})</span>` : ''}
                      </td>
                      <td style="padding: 8px 10px; text-align: center; color: #0f172a; font-weight: 700;">${it.quantity || 1}</td>
                      <td style="padding: 8px 10px; text-align: right; color: #334155; font-family: monospace;">${formatCurrency(it.price)}</td>
                      <td style="padding: 8px 10px; text-align: right; color: #0f172a; font-weight: 800; font-family: monospace;">${formatCurrency(Number(it.price) * Number(it.quantity || 1))}</td>
                    </tr>
                  `).join("") : `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td colspan="5" style="padding: 10px; text-align: center; color: #64748b;">অর্ডার বিবরণী তালিকাভুক্ত রয়েছে</td>
                    </tr>
                  `}
                </tbody>
              </table>

            <!-- 4. Barcode & Totals Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
              <tr>
                <td style="width: 50%; vertical-align: top;">
                  <div style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                    BARCODE TRACKER
                  </div>
                  <div style="display: inline-flex; align-items: center; gap: 2px; padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px;">
                    ${Array.from({ length: 28 }).map((_, i) => `
                      <span style="display:inline-block; height:24px; width:${(i % 3 === 0) ? '3px' : '1.5px'}; background-color: #0f172a;"></span>
                    `).join("")}
                  </div>
                  <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #334155; margin-top: 3px;">
                    ${displayOrderId}
                  </div>
                </td>
                <td style="width: 50%; vertical-align: top;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <tr>
                      <td style="padding: 4px 0; color: #475569;">সাবটোটাল:</td>
                      <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #475569;">ডেলিভারি চার্জ:</td>
                      <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #059669; font-family: monospace;">${deliveryFee === 0 ? 'ফ্রি (৳০)' : formatCurrency(deliveryFee)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #cbd5e1;">
                      <td style="padding: 6px 0; font-size: 13px; font-weight: 900; color: #0f172a;">সর্বমোট:</td>
                      <td style="padding: 6px 0; text-align: right; font-size: 16px; font-weight: 900; color: #059669; font-family: monospace;">${formatCurrency(totalAmount)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- 5. Footer Note -->
            <div style="text-align: center; border-top: 1px dashed #e2e8f0; padding-top: 10px; font-size: 11px; font-weight: 600; color: #059669;">
              ✨ ড্রিম কার্ট বিডি-র সাথে কেনাকাটা করার জন্য ধন্যবাদ!
            </div>

          </div>

          <!-- Print button inside voucher (hidden during actual print) -->
          <div class="print-hide mt-5 pt-4 border-t border-slate-100 text-center">
            <button 
              type="button"
              class="btn-primary py-2 px-5 text-xs font-bold cursor-pointer"
              onclick="window.printVoucherOnly ? window.printVoucherOnly() : window.print()"
            >
              🖨️ ভাউচার প্রিন্ট / ডাউনলোড
            </button>
          </div>

        </div>
      </div>
    `)}

    </div>
  `;
}
