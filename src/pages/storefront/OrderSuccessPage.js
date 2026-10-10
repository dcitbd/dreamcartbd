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

// Global helper for printing ONLY the invoice voucher
if (typeof window !== 'undefined') {
  window.printVoucherOnly = function() {
    const voucherEl = document.getElementById('official-invoice-voucher');
    if (!voucherEl) {
      window.print();
      return;
    }

    // Clone the voucher element
    const clone = voucherEl.cloneNode(true);
    // Remove screen-only elements from the clone
    clone.querySelectorAll('.print-hide, .btn-print, button').forEach(el => el.remove());

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

    // Trigger printing once iframe document is parsed
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => printFrame.remove(), 2500);
    }, 300);
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
                      ${order.customer_name || "সম্মানিত গ্রাহক"}
                    </div>
                    <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">
                      📞 মোবাইল: <strong style="color: #0f172a; font-family: monospace;">${order.phone || "01700000000"}</strong>
                    </div>
                    <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                      📍 ঠিকানা: <span style="color: #1e293b;">${order.address || "বাংলাদেশ"}</span>
                    </div>
                  </div>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; height: 100%;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px; margin-bottom: 4px;">
                      পেমেন্ট বিবরণ:
                    </div>
                    <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                      মেথড: <strong style="color: #0f172a;">${order.payment_method || "Cash On Delivery (COD)"}</strong>
                    </div>
                    <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                      পেমেন্ট স্ট্যাটাস: <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; ${order.payment_status === 'Paid' ? 'background-color: #d1fae5; color: #065f46;' : 'background-color: #fef3c7; color: #92400e;'}">${order.payment_status || "COD"}</span>
                    </div>
                    <div style="font-size: 11px; color: #475569;">
                      অর্ডার স্ট্যাটাস: <strong style="color: #059669;">${order.order_status || "Order Placed"}</strong>
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
                      ${it.name || "পণ্য"}
                      ${(it.color || it.size) ? `<span style="font-size: 10px; color: #059669; font-weight: normal; margin-left: 4px;">(${[it.color, it.size].filter(Boolean).join(', ')})</span>` : ''}
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

    </div>
  `;
}
