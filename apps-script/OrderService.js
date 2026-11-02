/**
 * Dream Cart BD - Order Service
 * Manages order creation, retrieval, PDF voucher generation, and fast email dispatches.
 */

var OrderService = (function() {

  /**
   * মূল অ্যাডমিন ইমেইল প্রাপকদের তালিকা
   */
  var ADMIN_EMAILS = "jainal.dcitbd@gmail.com, saiful05333@gmail.com";

  /**
   * নতুন অর্ডার তৈরি এবং দ্রুত রেসপন্স প্রদান
   * @param {Object} orderData 
   * @returns {Object}
   */
  function createOrder(orderData) {
    if (!orderData) {
      throw new Error("অর্ডারের তথ্য পাওয়া যায়নি।");
    }

    // ১. অর্ডার আইডি ও ট্র্যাকিং কোড জেনারেশন
    var orderId = (typeof IDGenerator !== 'undefined' && IDGenerator.generateOrderId)
      ? IDGenerator.generateOrderId()
      : 'ORD-' + new Date().getTime();

    var orderNumber = orderId;
    var createdAt = new Date().toISOString();
    var customerName = orderData.name || orderData.customerName || "Customer";
    var customerPhone = orderData.phone || orderData.customerPhone || "";
    var customerAddress = orderData.address || orderData.shippingAddress || "";
    var deliveryArea = orderData.deliveryArea || orderData.city || "Regular";
    var items = Array.isArray(orderData.items) ? orderData.items : [];
    var subtotal = Number(orderData.subtotal || 0);
    var deliveryCharge = Number(orderData.deliveryCharge || orderData.shippingFee || 0);
    var discount = Number(orderData.discount || 0);
    var total = Number(orderData.total || (subtotal + deliveryCharge - discount));
    var paymentMethod = orderData.paymentMethod || "Cash on Delivery";
    var note = orderData.notes || orderData.note || "N/A";

    var completeOrder = {
      orderId: orderId,
      orderNumber: orderNumber,
      createdAt: createdAt,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      deliveryArea: deliveryArea,
      items: items,
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      discount: discount,
      total: total,
      paymentMethod: paymentMethod,
      note: note,
      status: "Pending"
    };

    // ২. শীটে অর্ডার রেকর্ড সংরক্ষণ
    try {
      if (typeof SheetRepository !== 'undefined' && SheetRepository.saveOrder) {
        SheetRepository.saveOrder(completeOrder);
      } else if (typeof Database !== 'undefined' && Database.insert) {
        Database.insert("orders", completeOrder);
      }
    } catch (dbError) {
      Logger.log("Database Save Error: " + dbError.toString());
    }

    // ৩. মেইল এবং পিডিএফ ব্যাকগ্রাউন্ডে দ্রুত পাঠানো (UI ল্যাগ এড়ানোর ব্যবস্থা)
    try {
      sendOrderNotificationAsync(completeOrder);
    } catch (mailError) {
      Logger.log("Order Notification Error: " + mailError.toString());
    }

    // ৪. তাৎক্ষণিক ফ্রন্টএন্ডে ভাউচার ডেটা রিটার্ন (কাস্টমার যেন সাথে সাথে রেজাল্ট পায়)
    return {
      success: true,
      message: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!",
      orderId: orderId,
      order: completeOrder
    };
  }

  /**
   * অ্যাডমিনদের কাছে নান্দনিক মেইল ও পিডিএফ ভাউচার প্রেরণ
   * @param {Object} order 
   */
  function sendOrderNotificationAsync(order) {
    var subject = "🛒 নতুন অর্ডার নোটিফিকেশন - #" + order.orderId + " (" + order.customerName + ")";
    var htmlBody = generateModernEmailTemplate(order);

    // পিডিএফ ভাউচার তৈরি
    var pdfBlob = null;
    try {
      pdfBlob = generateVoucherPdfBlob(order);
    } catch (e) {
      Logger.log("PDF Generation failed, fallback to plain notification: " + e.toString());
    }

    var mailOptions = {
      to: ADMIN_EMAILS,
      subject: subject,
      htmlBody: htmlBody,
      name: "Dream Cart BD Order Hub"
    };

    if (pdfBlob) {
      mailOptions.attachments = [pdfBlob];
    }

    // সমান্তরালভাবে অ্যাডমিন ঠিকানায় মেইল পাঠানো
    MailApp.sendEmail(mailOptions);
  }

  /**
   * আকর্ষণীয়, রেসপনসিভ ও আধুনিক HTML মেইল টেমপ্লেট
   * @param {Object} order 
   * @returns {string}
   */
  function generateModernEmailTemplate(order) {
    var itemsRows = "";
    if (order.items && order.items.length > 0) {
      order.items.forEach(function(item, idx) {
        var itemName = item.name || item.title || "Product";
        var qty = item.quantity || item.qty || 1;
        var price = Number(item.price || 0);
        var itemTotal = qty * price;
        var variant = item.variant || item.selectedVariant || "";

        itemsRows += `
          <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 14px 16px; font-size: 14px; color: #1a202c;">
              <strong>${itemName}</strong>
              ${variant ? `<div style="font-size: 12px; color: #718096; margin-top: 3px;">ভ্যারিয়েন্ট: ${variant}</div>` : ""}
            </td>
            <td style="padding: 14px 16px; font-size: 14px; color: #4a5568; text-align: center;">${qty}</td>
            <td style="padding: 14px 16px; font-size: 14px; color: #4a5568; text-align: right;">৳${price.toLocaleString()}</td>
            <td style="padding: 14px 16px; font-size: 14px; color: #0d9488; font-weight: 700; text-align: right;">৳${itemTotal.toLocaleString()}</td>
          </tr>
        `;
      });
    }

    var orderDate = new Date(order.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

    return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>নতুন অর্ডার</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="640" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
              
              <!-- হেডার ব্যানার -->
              <tr>
                <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">Dream Cart BD</h1>
                  <p style="margin: 6px 0 0; font-size: 14px; color: #ccfbf1;">⚡ নতুন অর্ডারের নোটিফিকেশন ও ভাউচার</p>
                </td>
              </tr>

              <!-- অর্ডার ব্যাজ ও স্ট্যাটাস -->
              <tr>
                <td style="padding: 24px 30px 12px; background-color: #f0fdfa;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="font-size: 14px; color: #0f766e; font-weight: 700;">
                        অর্ডার নং: <span style="background: #14b8a6; color: #ffffff; padding: 3px 9px; border-radius: 6px;">#${order.orderId}</span>
                      </td>
                      <td align="right" style="font-size: 13px; color: #5eead4; color: #047857;">
                        🕒 ${orderDate}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- কাস্টমার বিবরণ -->
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 14px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">
                    👤 কাস্টমারের তথ্য
                  </h3>
                  <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                    <tr>
                      <td width="28%" style="font-weight: 600; color: #1f2937;">নাম:</td>
                      <td>${order.customerName}</td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #1f2937;">মোবাইল:</td>
                      <td><a href="tel:${order.customerPhone}" style="color: #0d9488; text-decoration: none; font-weight: 700;">${order.customerPhone}</a></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #1f2937;">ডেলিভারি ঠিকানা:</td>
                      <td>${order.customerAddress} (${order.deliveryArea})</td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: #1f2937;">পেমেন্ট মেথড:</td>
                      <td><span style="font-weight: 600; color: #111827;">${order.paymentMethod}</span></td>
                    </tr>
                    ${order.note && order.note !== 'N/A' ? `
                    <tr>
                      <td style="font-weight: 600; color: #1f2937;">গ্রাহকের নোট:</td>
                      <td style="color: #b45309; font-style: italic;">${order.note}</td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>

              <!-- পণ্যের তালিকা -->
              <tr>
                <td style="padding: 10px 30px;">
                  <h3 style="margin: 0 0 14px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">
                    📦 অর্ডারকৃত আইটেমস
                  </h3>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                        <th align="left" style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #4b5563;">আইটেম</th>
                        <th align="center" style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #4b5563;">পরিমাণ</th>
                        <th align="right" style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #4b5563;">মূল্য</th>
                        <th align="right" style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #4b5563;">মোট</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRows}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- মোট হিসাব -->
              <tr>
                <td style="padding: 16px 30px 24px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px;">
                    <tr>
                      <td align="right" style="color: #6b7280;">সাবটোটাল:</td>
                      <td align="right" width="130" style="font-weight: 600; color: #1f2937;">৳${order.subtotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td align="right" style="color: #6b7280;">ডেলিভারি চার্জ:</td>
                      <td align="right" style="font-weight: 600; color: #1f2937;">+ ৳${order.deliveryCharge.toLocaleString()}</td>
                    </tr>
                    ${order.discount > 0 ? `
                    <tr>
                      <td align="right" style="color: #dc2626;">ডিসকাউন্ট:</td>
                      <td align="right" style="font-weight: 600; color: #dc2626;">- ৳${order.discount.toLocaleString()}</td>
                    </tr>` : ''}
                    <tr style="border-top: 2px solid #e5e7eb;">
                      <td align="right" style="font-size: 16px; font-weight: 800; color: #111827; padding-top: 10px;">সর্বমোট প্রদেয়:</td>
                      <td align="right" style="font-size: 18px; font-weight: 800; color: #0d9488; padding-top: 10px;">৳${order.total.toLocaleString()}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ফুটার -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8;">
                  <p style="margin: 0 0 6px;">📄 এই ইমেইলের সাথে অফিশিয়াল <strong>অর্ডার ভাউচার পিডিএফ</strong> সংযুক্ত করা হয়েছে।</p>
                  <p style="margin: 0;">&copy; Dream Cart BD | অটোমেটেড অর্ডার প্রসেসিং সিস্টেম</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  /**
   * অর্ডারের জন্য ভাউচার পিডিএফ ব্লব তৈরি করে
   * @param {Object} order 
   * @returns {Blob}
   */
  function generateVoucherPdfBlob(order) {
    var itemsRows = "";
    if (order.items && order.items.length > 0) {
      order.items.forEach(function(item) {
        var name = item.name || item.title || "Product";
        var qty = item.quantity || item.qty || 1;
        var price = Number(item.price || 0);
        var sub = qty * price;
        itemsRows += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${qty}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">৳${price}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">৳${sub}</td>
          </tr>
        `;
      });
    }

    var voucherHtml = `
      <html>
      <head>
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 25px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #0d9488; font-size: 24px; }
          .header p { margin: 4px 0 0; color: #666; font-size: 13px; }
          .meta-box { width: 100%; margin-bottom: 20px; font-size: 13px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          .items-table th { background: #f4f4f4; padding: 8px; border: 1px solid #ddd; text-align: left; }
          .total-box { float: right; width: 250px; font-size: 13px; margin-bottom: 30px; }
          .total-box td { padding: 4px; }
          .footer { clear: both; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dream Cart BD</h1>
          <p>অফিশিয়াল অর্ডার ইনভয়েস / ভাউচার</p>
        </div>

        <table class="meta-box">
          <tr>
            <td width="55%" valign="top">
              <strong>ইনভয়েস প্রাপক:</strong><br>
              নাম: ${order.customerName}<br>
              ফোন: ${order.customerPhone}<br>
              ঠিকানা: ${order.customerAddress}<br>
              এলাকা: ${order.deliveryArea}
            </td>
            <td width="45%" valign="top" align="right">
              <strong>ইনভয়েস আইডি:</strong> #${order.orderId}<br>
              <strong>তারিখ:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB')}<br>
              <strong>পেমেন্ট:</strong> ${order.paymentMethod}<br>
              <strong>স্ট্যাটাস:</strong> ${order.status}
            </td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th>বিবরণ</th>
              <th style="text-align: center;">পরিমাণ</th>
              <th style="text-align: right;">দর</th>
              <th style="text-align: right;">মোট</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <table class="total-box">
          <tr>
            <td>সাবটোটাল:</td>
            <td align="right">৳${order.subtotal}</td>
          </tr>
          <tr>
            <td>ডেলিভারি চার্জ:</td>
            <td align="right">৳${order.deliveryCharge}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td>ডিসকাউন্ট:</td>
            <td align="right">-৳${order.discount}</td>
          </tr>` : ''}
          <tr style="border-top: 1px solid #333; font-weight: bold;">
            <td>মোট প্রদেয়:</td>
            <td align="right">৳${order.total}</td>
          </tr>
        </table>

        <div class="footer">
          <p>Dream Cart BD-এর সাথে থাকার জন্য ধন্যবাদ। কোনো সহযোগিতার প্রয়োজন হলে আমাদের হেল্পলাইনে যোগাযোগ করুন।</p>
        </div>
      </body>
      </html>
    `;

    return Utilities.newBlob(voucherHtml, "text/html", "voucher.html")
      .getAs("application/pdf")
      .setName("Voucher_" + order.orderId + ".pdf");
  }

  return {
    createOrder: createOrder,
    sendOrderNotificationAsync: sendOrderNotificationAsync
  };

})();
