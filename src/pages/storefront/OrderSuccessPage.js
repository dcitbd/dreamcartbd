/**
 * DREAM CART BD — ORDER SUCCESS PAGE (OrderSuccessPage.js)
 * Implements:
 * - Instant Loading (checks local/memory storage first with 1.2s timeout fallback so page never freezes)
 * - Harmonious high-contrast color scheme for both Light and Dark mode
 * - Fixed WhatsApp button styling (zero unreadable text in dark mode)
 * - Isolated Voucher-Only Printing (only the official invoice prints, no website header/footer/cards)
 * - Clean barcode and watermark rendering in all themes
 */

import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';

// Global helper for printing ONLY the invoice voucher
if (typeof window !== 'undefined') {
  window.printVoucherOnly = function() {
    const voucherEl = document.getElementById('official-invoice-voucher');
    if (!voucherEl) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for printing ONLY the voucher
    let printFrame = document.getElementById('voucher-print-iframe');
    if (printFrame) {
      printFrame.remove();
    }

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
            margin: 12mm 15mm;
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
            padding: 10px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .voucher-box {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 16px !important;
            box-shadow: none !important;
            position: relative;
          }
          .voucher-watermark {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 0;
          }
          .voucher-watermark-img {
            width: 220px;
            opacity: 0.05 !important;
            filter: grayscale(100%);
          }
          .print-hide, .btn-print, button {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table th, table td {
            padding: 8px 6px;
          }
          table thead tr {
            border-bottom: 2px solid #e2e8f0;
          }
          table tbody tr {
            border-bottom: 1px solid #f1f5f9;
          }
          .barcode-container {
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            padding: 4px 8px;
            display: inline-flex;
            gap: 2px;
          }
          .barcode-bar {
            background-color: #0f172a !important;
            display: inline-block;
            height: 28px;
          }
          .badge-pill {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
          }
          .badge-emerald {
            background: #d1fae5 !important;
            color: #065f46 !important;
          }
          .badge-amber {
            background: #fef3c7 !important;
            color: #92400e !important;
          }
        </style>
      </head>
      <body>
        ${voucherEl.outerHTML}
      </body>
      </html>
    `);
    doc.close();

    // Trigger printing once iframe is parsed
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => printFrame.remove(), 2500);
    }, 250);
  };
}

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
  const dateStr = order.date || new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

  const waReminder1 = `https://wa.me/8801581703822?text=${encodeURIComponent(`Hello Dream Cart BD, I placed order ${displayOrderId} (${formatCurrency(totalAmount)}). Please confirm shipment.`)}`;
  const waReminder2 = `https://wa.me/8801818273838?text=${encodeURIComponent(`Hello Dream Cart BD, I placed order ${displayOrderId} (${formatCurrency(totalAmount)}). Please confirm shipment.`)}`;

  return `
    <style>
      /* High-contrast Theme & Isolated Print Styles for Order Success Page */
      .success-card {
        background-color: #ffffff;
        color: #0f172a;
        border: 1px solid #10b981;
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

      .btn-whatsapp-1 {
        background-color: #25D366;
        color: #ffffff !important;
        border: none;
        font-weight: 700;
        box-shadow: 0 2px 4px rgba(37, 211, 102, 0.25);
        transition: all 0.15s ease;
      }
      .btn-whatsapp-1:hover {
        background-color: #1ebd5a;
        transform: translateY(-1px);
      }

      .btn-whatsapp-2 {
        background-color: #ffffff;
        color: #0f172a !important;
        border: 1px solid #cbd5e1;
        font-weight: 700;
        transition: all 0.15s ease;
      }
      .btn-whatsapp-2:hover {
        background-color: #f8fafc;
        border-color: #94a3b8;
      }
      .dark .btn-whatsapp-2 {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #475569 !important;
      }
      .dark .btn-whatsapp-2:hover {
        background-color: #334155 !important;
      }

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

      /* Voucher Card Styles */
      .voucher-box {
        background-color: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      }
      .dark .voucher-box {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
      }

      .voucher-surface {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
      }
      .dark .voucher-surface {
        background-color: #0f172a !important;
        border-color: #334155 !important;
      }

      /* Barcode: Always white card with black bars so it never renders invisible */
      .voucher-barcode-wrapper {
        background-color: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
        padding: 4px 8px;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        border-radius: 6px;
      }
      .voucher-barcode-bar {
        background-color: #0f172a !important;
        display: inline-block;
        height: 24px;
      }

      /* Print isolation via @media print */
      @media print {
        header, footer, nav, #header-mount, #footer-mount, #mobilenav-mount, #floatingactions-mount, #cartdrawer-mount, #fraudmodal-mount, .no-print, .print-hide {
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
          padding: 16px !important;
          background: #ffffff !important;
          color: #000000 !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
        }
        #official-invoice-voucher * {
          color: #000000 !important;
        }
        .voucher-barcode-wrapper {
          background-color: #ffffff !important;
          border: 1px solid #94a3b8 !important;
        }
        .voucher-barcode-bar {
          background-color: #000000 !important;
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
          <span class="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-1 border border-emerald-200 dark:border-emerald-800">
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

        <!-- VOUCHER BOX -->
        <div id="official-invoice-voucher" class="voucher-box rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto relative overflow-hidden font-sans">
          
          <!-- Watermark Logo -->
          <div class="voucher-watermark pointer-events-none select-none z-0 absolute inset-0 flex items-center justify-center">
            <img 
              src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
              alt="Watermark" 
              class="voucher-watermark-img w-48 opacity-[0.05] filter grayscale"
            />
          </div>

          <div class="relative z-10 space-y-5">
            
            <!-- Voucher Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b-2 border-emerald-600 gap-4">
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
                    alt="Dream Cart BD Logo" 
                    class="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Dream Cart <span class="text-emerald-600">BD</span>
                  </h2>
                  <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Smart Digital Commerce Platform</p>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা।</p>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300">হটলাইন: 01581703822, 01818273838</p>
                </div>
              </div>

              <div class="sm:text-right space-y-0.5">
                <div class="inline-block bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-1 shadow-xs">
                  Official Invoice
                </div>
                <div class="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Order ID: <span class="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-black">${displayOrderId}</span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">তারিখ: ${dateStr}</div>
              </div>
            </div>

            <!-- Customer & Payment Info Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 text-xs">
              <div class="voucher-surface p-3.5 rounded-xl space-y-1">
                <h4 class="font-bold uppercase text-[10px] tracking-wider text-emerald-700 dark:text-emerald-400">গ্রাহকের বিবরণ:</h4>
                <div class="font-bold text-slate-900 dark:text-white text-sm">${order.customer_name || "সম্মানিত গ্রাহক"}</div>
                <div class="text-slate-600 dark:text-slate-300">📞 মোবাইল: <strong>${order.phone || "01700000000"}</strong></div>
                <div class="text-slate-600 dark:text-slate-300">📍 ঠিকানা: ${order.address || "বাংলাদেশ"}</div>
              </div>

              <div class="voucher-surface p-3.5 rounded-xl sm:text-right space-y-1">
                <h4 class="font-bold uppercase text-[10px] tracking-wider text-emerald-700 dark:text-emerald-400">পেমেন্ট বিবরণ:</h4>
                <div class="text-slate-700 dark:text-slate-300">মেথড: <strong class="text-slate-900 dark:text-white">${order.payment_method || "Cash On Delivery (COD)"}</strong></div>
                <div class="text-slate-700 dark:text-slate-300">
                  স্ট্যাটাস: <span class="font-bold px-2 py-0.5 rounded text-[10px] ${order.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">${order.payment_status || "COD"}</span>
                </div>
                <div class="text-slate-700 dark:text-slate-300">অর্ডার স্ট্যাটাস: <strong class="text-emerald-600 dark:text-emerald-400">${order.order_status || "Order Placed"}</strong></div>
              </div>
            </div>

            <!-- Itemized Table -->
            <div class="py-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    <th class="py-2">নং</th>
                    <th class="py-2">পণ্য</th>
                    <th class="py-2 text-center">পরিমাণ</th>
                    <th class="py-2 text-right">দর</th>
                    <th class="py-2 text-right">মোট</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${items.length > 0 ? items.map((it, idx) => `
                    <tr>
                      <td class="py-2.5 text-slate-400">${idx + 1}</td>
                      <td class="py-2.5 font-medium text-slate-800 dark:text-slate-200">${it.name || "পণ্য"}</td>
                      <td class="py-2.5 text-center font-bold text-slate-900 dark:text-white">${it.quantity || 1}</td>
                      <td class="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">${formatCurrency(it.price)}</td>
                      <td class="py-2.5 text-right font-bold font-mono text-slate-900 dark:text-white">${formatCurrency(Number(it.price) * Number(it.quantity || 1))}</td>
                    </tr>
                  `).join("") : `
                    <tr>
                      <td colspan="5" class="py-3 text-center text-slate-500">অর্ডার বিবরণী তালিকাভুক্ত রয়েছে</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>

            <!-- Total Calculation & Barcode -->
            <div class="py-3 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              
              <!-- Barcode Box (Always High-Contrast Black on White) -->
              <div class="flex flex-col items-start gap-1">
                <div class="font-mono text-[9px] tracking-widest text-slate-400 dark:text-slate-500 uppercase">BARCODE TRACKER</div>
                <div class="voucher-barcode-wrapper">
                  ${Array.from({ length: 28 }).map((_, i) => `
                    <span class="voucher-barcode-bar" style="width:${(i % 3 === 0) ? '3px' : '1.5px'};"></span>
                  `).join("")}
                </div>
                <div class="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-bold">${displayOrderId}</div>
              </div>

              <!-- Total Summary -->
              <div class="w-full sm:w-64 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div class="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span class="font-bold text-slate-900 dark:text-white font-mono">${formatCurrency(subtotal)}</span>
                </div>
                <div class="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ${deliveryFee === 0 ? 'ফ্রি (৳০)' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 text-sm font-black text-slate-900 dark:text-white">
                  <span>সর্বমোট:</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-mono text-base font-black">${formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="pt-2 text-center space-y-1">
              <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✨ ড্রিম কার্ট বিডি-র সাথে কেনাকাটা করার জন্য ধন্যবাদ!
              </p>
            </div>

          </div>

          <!-- Print button inside voucher footer (screen only) -->
          <div class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center print-hide">
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

    </div>
  `;
}
