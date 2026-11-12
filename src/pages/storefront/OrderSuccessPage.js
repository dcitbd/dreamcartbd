/**
 * DREAM CART BD — ORDER SUCCESS PAGE (OrderSuccessPage.js)
 * Implements user requirements:
 * - Instant Loading: synchronous local storage check with fast 1.2s timeout fallback so page never hangs
 * - Harmonious high-contrast theme styling for both Light and Dark modes (zero unreadable buttons)
 * - White authentic receipt voucher with visible watermark logo (no dark background swallowing the watermark)
 * - Isolated, perfectly formatted voucher printing (table-based layout that never collapses into a single column)
 * - Barcode tracker clearly rendered in high contrast
 */

import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { renderVoucher } from '../../components/Voucher.js';

export async function renderOrderSuccessPage(orderId = "ORD-2609-8472") {
  let order = null;

  // 1. Instant cache check from localStorage (0ms — prevents order success loading delay)
  try {
    const localOrders = JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
    if (Array.isArray(localOrders) && localOrders.length > 0) {
      order = localOrders.find(o => {
        const oId = (o.order_id || o.orderId || '').toString().trim().toLowerCase();
        return oId === orderId.toString().trim().toLowerCase();
      });
      // Fallback to most recent order if ID matches or order was just created
      if (!order && localOrders[0]) {
        const firstId = (localOrders[0].order_id || localOrders[0].orderId || '').toString().trim().toLowerCase();
        if (firstId === orderId.toString().trim().toLowerCase()) {
          order = localOrders[0];
        }
      }
    }
  } catch (e) {}

  // 2. Fast timeout fetch fallback (capped at 1.2s max so the page never hangs)
  if (!order) {
    try {
      const fetchPromise = apiClient.request("orders/get", { orderId: orderId });
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 1200));
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res && res.data) {
        order = res.data;
      }
    } catch (e) {}
  }

  // 3. Fallback default order data if network/storage is empty
  if (!order) {
    order = {
      order_id: orderId,
      customer_name: "সম্মানিত গ্রাহক",
      phone: "01700000000",
      address: "বাংলাদেশ",
      payment_method: "Cash On Delivery (COD)",
      payment_status: "COD",
      order_status: "Order Placed",
      total_amount: 0,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
      items: []
    };
  }

  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : (
    order.products ? [{
      name: order.products,
      sku: order.color ? `${order.color} / ${order.size || 'Std'}` : "DCBD-ITEM",
      quantity: order.quantity || 1,
      price: order.total_amount || 0
    }] : []
  );

  const subtotal = items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);
  const totalAmount = Number(order.total_amount !== undefined ? order.total_amount : subtotal);
  const deliveryFee = order.delivery_fee !== undefined 
    ? Number(order.delivery_fee) 
    : (order.delivery_charge !== undefined 
        ? Number(order.delivery_charge) 
        : (subtotal >= 2000 ? 0 : Math.max(0, totalAmount - subtotal)));

  const displayOrderId = order.order_id || order.orderId || orderId;
  try {
    if (typeof window !== 'undefined' && window.__dcbdTrackAdEvent && totalAmount > 0) {
      window.__dcbdTrackAdEvent('Purchase', {
        ...order,
        order_id: displayOrderId,
        total_amount: totalAmount,
        items: items
      });
    }
  } catch (e) {}
  const dateStr = order.date || new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

  const waReminder1 = `https://wa.me/8801581703822?text=${encodeURIComponent(`Hello Dream Cart BD, I placed order ${displayOrderId} (${formatCurrency(totalAmount)}). Please confirm shipment.`)}`;
  const waReminder2 = `https://wa.me/8801818273838?text=${encodeURIComponent(`Hello Dream Cart BD, I placed order ${displayOrderId} (${formatCurrency(totalAmount)}). Please confirm shipment.`)}`;

  return `
    <style>
      /* Order Success Page Theme & Print Optimization */
      .success-card {
        background-color: #ffffff;
        color: #0f172a;
        border: 1.5px solid #10b981;
      }
      .dark .success-card {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #059669 !important;
      }

      .whatsapp-panel {
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #0f172a;
      }
      .dark .whatsapp-panel {
        background-color: #0f172a !important;
        border-color: #047857 !important;
        color: #f8fafc !important;
      }

      /* WhatsApp buttons with clear, high-contrast text in both themes */
      .btn-whatsapp-1 {
        background-color: #25D366;
        color: #ffffff !important;
        border: none;
        font-weight: 700;
        box-shadow: 0 2px 5px rgba(37, 211, 102, 0.3);
        transition: all 0.15s ease;
      }
      .btn-whatsapp-1:hover {
        background-color: #1ebd5a;
        transform: translateY(-1px);
      }

      .btn-whatsapp-2 {
        background-color: #ffffff;
        color: #0f172a !important;
        border: 1.5px solid #cbd5e1;
        font-weight: 700;
        transition: all 0.15s ease;
      }
      .btn-whatsapp-2:hover {
        background-color: #f8fafc;
        border-color: #94a3b8;
      }
      .dark .btn-whatsapp-2 {
        background-color: #064e3b !important;
        color: #a7f3d0 !important;
        border-color: #047857 !important;
      }
      .dark .btn-whatsapp-2:hover {
        background-color: #065f46 !important;
      }

      /* Navigation secondary action buttons */
      .btn-nav-outline {
        background-color: #ffffff;
        color: #0f172a !important;
        border: 1px solid #cbd5e1;
        font-weight: 600;
        transition: all 0.15s ease;
      }
      .btn-nav-outline:hover {
        background-color: #f8fafc;
        border-color: #94a3b8;
      }
      .dark .btn-nav-outline {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #475569 !important;
      }
      .dark .btn-nav-outline:hover {
        background-color: #334155 !important;
      }

      /* VOUCHER CARD STYLING: Authentic White Paper Invoice across both themes */
      .voucher-paper-container {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 18px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08) !important;
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
        #order-success-top-banner {
          display: none !important;
        }
        #voucher-container-wrapper {
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

    <div class="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      
      <!-- Top Success Announcement Banner -->
      <div id="order-success-top-banner" class="success-card rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg print-hide">
        
        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl sm:text-4xl shadow-md">
          ✓
        </div>

        <div class="space-y-1">
          <span class="inline-block bg-black text-white dark:bg-black dark:text-white text-xs font-black px-[10px] py-[10px] rounded-full uppercase tracking-wider mb-1 border border-emerald-200 dark:border-emerald-800">
            অর্ডার সফলভাবে সম্পন্ন হয়েছে
          </span>
          <h1 class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ধন্যবাদ! আপনার অর্ডারটি গৃহীত হয়েছে।
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto pt-1">
            আপনার অর্ডার আইডি: <strong class="font-mono text-emerald-600 dark:text-emerald-400 font-black text-base">${displayOrderId}</strong>
          </p>
        </div>

        <!-- WhatsApp Quick Confirm Toolbar (With High-Contrast Branded Buttons) -->
        <div class="whatsapp-panel p-4 rounded-2xl max-w-md mx-auto space-y-2.5">
          <div class="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-center gap-1.5">
            <span>💬</span>
            <span>দ্রুত ডেলিভারির জন্য হোয়াটসঅ্যাপে মেসেজ পাঠান:</span>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 justify-center">
            <a 
              href="${waReminder1}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-whatsapp-1 text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5"
            >
              <span>WhatsApp 1:</span>
              <span class="font-mono">01581703822</span>
            </a>
            <a 
              href="${waReminder2}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-whatsapp-2 text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5"
            >
              <span>WhatsApp 2:</span>
              <span class="font-mono">01818273838</span>
            </a>
          </div>
        </div>

        <!-- Navigation Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button 
            type="button"
            class="btn-primary text-xs py-2.5 px-6 font-bold shadow-md cursor-pointer"
            onclick="window.printVoucherOnly ? window.printVoucherOnly() : window.print()"
          >
            🖨️ ভাউচার প্রিন্ট / ডাউনলোড করুন
          </button>
          <a href="/track?orderId=${displayOrderId}" class="btn-nav-outline text-xs py-2.5 px-5 rounded-xl shadow-xs">
            🚚 পার্সেল ট্র্যাক করুন
          </a>
          <a href="/products" class="btn-nav-outline text-xs py-2.5 px-5 rounded-xl shadow-xs">
            🛍️ আরও শপিং করুন
          </a>
        </div>

      </div>

      <!-- Official Digital Voucher Container (Prints Exclusively) -->
      <div id="voucher-container-wrapper" class="space-y-3">
        <div class="text-center print-hide">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            অফিশিয়াল ডিজিটাল ইনভয়েস ভাউচার
          </span>
        </div>

        ${renderVoucher(order, { items, subtotal, deliveryFee, totalAmount, displayOrderId, dateStr })}
      </div>

    </div>
  `;
}
