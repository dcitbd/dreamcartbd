/**
 * Dream Cart BD - Order Service
 * Manages order creation, retrieval, PDF voucher generation, and fast email dispatches.
 */

var OrderService = (function() {

  /**
   * মূল অ্যাডমিন ইমেইল প্রাপকদের তালিকা
   */
  var ADMIN_EMAILS = "jainal.dcitbd@gmail.com, saiful05333@gmail.com";

  function formatBdt(num) {
    var n = Number(num || 0);
    if (isNaN(n)) n = 0;
    return "৳" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * নতুন অর্ডার তৈরি এবং দ্রুত রেসপন্স প্রদান
   * @param {Object} orderData 
   * @returns {Object}
   */
  function createOrder(orderData) {
    if (!orderData) {
      throw new Error("অর্ডারের তথ্য পাওয়া যায়নি।");
    }

    var orderId = orderData.orderId || orderData.order_id || ((typeof IDGenerator !== 'undefined' && IDGenerator.generateOrderId)
      ? IDGenerator.generateOrderId()
      : 'ORD-' + Math.floor(100000 + Math.random() * 900000));

    var orderNumber = orderId;
    var createdAt = orderData.date || orderData.Date || new Date().toISOString();
    var customerName = orderData.customer_name || orderData.Customer_Name || orderData.name || orderData.customerName || "সম্মানিত গ্রাহক";
    var customerPhone = orderData.phone || orderData.Phone || orderData.customerPhone || "";
    var customerAddress = orderData.address || orderData.Address || orderData.shippingAddress || "";
    var deliveryArea = orderData.deliveryArea || orderData.city || "Regular";
    var items = Array.isArray(orderData.items) ? orderData.items : [];
    var subtotal = Number(orderData.subtotal || 0);
    var deliveryCharge = Number(orderData.delivery_fee !== undefined ? orderData.delivery_fee : (orderData.deliveryCharge || orderData.shippingFee || 0));
    var discount = Number(orderData.discount || 0);
    var total = Number(orderData.total_amount !== undefined ? orderData.total_amount : (orderData.total || (subtotal + deliveryCharge - discount)));
    var paymentMethod = orderData.payment_method || orderData.paymentMethod || "Cash On Delivery (COD)";
    var paymentStatus = orderData.payment_status || (String(paymentMethod).toLowerCase().indexOf('cod') !== -1 || String(paymentMethod).toLowerCase().indexOf('cash') !== -1 ? "COD" : "Paid");
    var orderStatus = orderData.order_status || orderData.status || "Order Placed";
    var transactionId = orderData.transaction_id || orderData.trxId || "N/A";
    var note = orderData.customer_note || orderData.notes || orderData.note || "N/A";

    var completeOrder = {
      orderId: orderId,
      order_id: orderId,
      orderNumber: orderNumber,
      createdAt: createdAt,
      date: createdAt,
      customerName: customerName,
      customer_name: customerName,
      customerPhone: customerPhone,
      phone: customerPhone,
      customerAddress: customerAddress,
      address: customerAddress,
      deliveryArea: deliveryArea,
      items: items,
      products: orderData.products || "",
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      delivery_fee: deliveryCharge,
      discount: discount,
      total: total,
      total_amount: total,
      paymentMethod: paymentMethod,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      transaction_id: transactionId,
      note: note,
      status: orderStatus,
      order_status: orderStatus
    };

    try {
      if (typeof SheetRepository !== 'undefined' && SheetRepository.saveOrder) {
        SheetRepository.saveOrder(completeOrder);
      } else if (typeof Database !== 'undefined' && Database.insert) {
        Database.insert("orders", completeOrder);
      }
    } catch (dbError) {
      Logger.log("Database Save Error: " + dbError.toString());
    }

    try {
      sendOrderNotificationAsync(completeOrder);
    } catch (mailError) {
      Logger.log("Order Notification Error: " + mailError.toString());
    }

    return {
      success: true,
      message: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!",
      orderId: orderId,
      order_id: orderId,
      order: completeOrder
    };
  }

  /**
   * অ্যাডমিনদের কাছে হুবহু অফিশিয়াল ইনভয়েস ভাউচার মেইল ও পিডিএফ প্রেরণ
   * @param {Object} order 
   */
  function sendOrderNotificationAsync(order) {
    var orderId = order.orderId || order.order_id || "ORD-000000";
    var customerName = order.customerName || order.customer_name || "গ্রাহক";
    var totalAmt = Number(order.total || order.total_amount || 0);
    var subject = "🛒 [নতুন অর্ডার ভাউচার] " + orderId + " — " + customerName + " (৳" + totalAmt + ")";

    var htmlBody = generateModernEmailTemplate(order, false);
    var pdfBlob = null;
    try {
      pdfBlob = generateVoucherPdfBlob(order);
    } catch (e) {
      Logger.log("PDF Generation failed, fallback to HTML email: " + e.toString());
    }

    var mailOptions = {
      to: ADMIN_EMAILS,
      subject: subject,
      htmlBody: htmlBody,
      name: "Dream Cart BD Official Invoice"
    };

    if (pdfBlob) {
      mailOptions.attachments = [pdfBlob];
    }

    MailApp.sendEmail(mailOptions);
  }

  /**
   * ছবির হুবহু অফিশিয়াল ইনভয়েস ভাউচার HTML টেমপ্লেট (ইমেইল ও পিডিএফ উভয়ের জন্য)
   * @param {Object} order 
   * @param {boolean} isForPdf
   * @returns {string}
   */
  function generateModernEmailTemplate(order, isForPdf) {
    var orderId = order.orderId || order.order_id || "ORD-000000";
    var dateStr = order.date || order.createdAt || "";
    try {
      if (dateStr && dateStr.indexOf("T") !== -1) {
        dateStr = Utilities.formatDate(new Date(dateStr), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
      }
    } catch (e) {}
    if (!dateStr) {
      dateStr = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
    }

    if (typeof buildOfficialVoucherHtml === "function") {
      return buildOfficialVoucherHtml(orderId, order, dateStr, !!isForPdf);
    }

    var customerName = order.customerName || order.customer_name || "সম্মানিত গ্রাহক";
    var customerPhone = order.customerPhone || order.phone || "01700000000";
    var customerAddress = order.customerAddress || order.address || "বাংলাদেশ";
    var paymentMethod = order.paymentMethod || order.payment_method || "Cash On Delivery (COD)";
    var isCod = String(paymentMethod).toLowerCase().indexOf("cod") !== -1 || String(paymentMethod).toLowerCase().indexOf("cash") !== -1;
    var rawPayStatus = order.payment_status || (isCod ? "COD" : "Paid");
    var isPaid = String(rawPayStatus).toLowerCase() === "paid";
    var orderStatus = order.order_status || order.status || "Order Placed";

    var items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [{
      name: order.products || "পণ্য সমাহার",
      color: order.color || "",
      size: order.size || "",
      quantity: order.quantity || 1,
      price: order.total || order.total_amount || 0
    }];

    var calcSub = 0;
    var itemsRows = "";
    items.forEach(function(it, idx) {
      var name = it.name || it.title || "পণ্য";
      var qty = Number(it.quantity || it.qty || 1);
      var price = Number(it.price || 0);
      var lineTotal = qty * price;
      calcSub += lineTotal;

      var vParts = [];
      if (it.color && String(it.color).toLowerCase() !== "standard") vParts.push(it.color);
      if (it.size && String(it.size).toLowerCase() !== "free size") vParts.push(it.size);
      if (vParts.length === 0 && (it.variant || it.selectedVariant)) vParts.push(it.variant || it.selectedVariant);
      var vHtml = vParts.length > 0 ? ' <span style="font-size: 11px; color: #059669; font-weight: 500; margin-left: 4px;">(' + vParts.join(", ") + ')</span>' : '';

      itemsRows += '<tr style="border-bottom: 1px solid #e2e8f0;">' +
        '<td style="padding: 12px 10px; color: #64748b; font-size: 12px;">' + (idx + 1) + '</td>' +
        '<td style="padding: 12px 10px; color: #0f172a; font-size: 12px; font-weight: 700; line-height: 1.45;">' + name + vHtml + '</td>' +
        '<td style="padding: 12px 10px; text-align: center; color: #0f172a; font-size: 12px; font-weight: 800;">' + qty + '</td>' +
        '<td style="padding: 12px 10px; text-align: right; color: #334155; font-size: 12px; font-family: monospace;">' + formatBdt(price) + '</td>' +
        '<td style="padding: 12px 10px; text-align: right; color: #0f172a; font-size: 12px; font-weight: 800; font-family: monospace;">' + formatBdt(lineTotal) + '</td>' +
      '</tr>';
    });

    var subtotal = Number(order.subtotal || calcSub);
    var totalAmount = Number(order.total || order.total_amount || subtotal);
    var deliveryFee = order.deliveryCharge !== undefined ? Number(order.deliveryCharge) : Math.max(0, totalAmount - subtotal);
    var logoUrl = "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg";
    var payBadgeStyle = isPaid ? "background-color: #d1fae5; color: #065f46;" : "background-color: #fef3c7; color: #92400e;";
    var barcodeBars = "";
    for (var b = 0; b < 28; b++) {
      barcodeBars += '<td style="padding: 0 1px;"><div style="height: 24px; width: ' + ((b % 3 === 0) ? "3px" : "1.5px") + '; background-color: #0f172a;"></div></td>';
    }

    return '<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>Official Invoice - ' + orderId + '</title></head>' +
    '<body style="margin:0;padding:' + (isForPdf ? '0' : '24px 12px') + ';background-color:' + (isForPdf ? '#ffffff' : '#f1f5f9') + ';font-family:\'Plus Jakarta Sans\',\'Segoe UI\',sans-serif;color:#0f172a;">' +
      '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center">' +
        '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #cbd5e1;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.08);">' +
          '<tr><td style="padding:28px 30px;background-image:url(\'' + logoUrl + '\');background-repeat:no-repeat;background-position:center;background-size:240px;">' +
            '<div style="background-color:rgba(255,255,255,0.93);padding:4px;border-radius:12px;">' +
              '<table width="100%" style="border-collapse:collapse;border-bottom:2px solid #059669;margin-bottom:18px;"><tr>' +
                '<td style="vertical-align:top;width:62%;padding-bottom:14px;"><table><tr>' +
                  '<td style="padding-right:12px;"><img src="' + logoUrl + '" width="52" height="52" style="width:52px;height:52px;object-fit:contain;border-radius:12px;border:1px solid #e2e8f0;padding:2px;background:#fff;" /></td>' +
                  '<td><div style="font-size:22px;font-weight:900;color:#0f172a;">Dream Cart <span style="color:#059669;">BD</span></div>' +
                  '<div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-top:3px;">SMART DIGITAL COMMERCE PLATFORM</div>' +
                  '<div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.45;">চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা।<br/>হটলাইন: <strong style="color:#0f172a;">01581703822, 01818273838</strong></div></td>' +
                '</tr></table></td>' +
                '<td style="vertical-align:top;text-align:right;width:38%;padding-bottom:14px;">' +
                  '<div style="display:inline-block;background:#059669;color:#fff;font-size:11px;font-weight:800;padding:5px 14px;border-radius:9999px;text-transform:uppercase;margin-bottom:8px;">OFFICIAL INVOICE</div>' +
                  '<div style="font-size:13px;font-weight:700;color:#334155;">Order ID: <span style="font-family:monospace;font-size:15px;font-weight:900;color:#059669;">' + orderId + '</span></div>' +
                  '<div style="font-size:11px;color:#64748b;margin-top:3px;">তারিখ: <span style="color:#334155;font-weight:600;">' + dateStr + '</span></div>' +
                '</td></tr></table>' +
              '<table width="100%" style="border-collapse:collapse;margin-bottom:18px;"><tr>' +
                '<td style="width:50%;vertical-align:top;padding-right:8px;"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;min-height:90px;">' +
                  '<div style="font-size:11px;font-weight:800;color:#059669;margin-bottom:6px;">গ্রাহকের বিবরণ:</div>' +
                  '<div style="font-size:14px;font-weight:800;color:#0f172a;margin-bottom:4px;">' + customerName + '</div>' +
                  '<div style="font-size:11.5px;color:#475569;margin-bottom:4px;">📞 মোবাইল: <strong style="color:#0f172a;font-family:monospace;">' + customerPhone + '</strong></div>' +
                  '<div style="font-size:11.5px;color:#475569;">📍 ঠিকানা: <span style="color:#1e293b;">' + customerAddress + '</span></div>' +
                '</div></td>' +
                '<td style="width:50%;vertical-align:top;padding-left:8px;"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;min-height:90px;">' +
                  '<div style="font-size:11px;font-weight:800;color:#059669;margin-bottom:6px;">পেমেন্ট বিবরণ:</div>' +
                  '<div style="font-size:11.5px;color:#475569;margin-bottom:5px;">মেথড: <strong style="color:#0f172a;">' + paymentMethod + '</strong></div>' +
                  '<div style="font-size:11.5px;color:#475569;margin-bottom:5px;">পেমেন্ট স্ট্যাটাস: <span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:800;' + payBadgeStyle + '">' + rawPayStatus + '</span></div>' +
                  '<div style="font-size:11.5px;color:#475569;">অর্ডার স্ট্যাটাস: <strong style="color:#059669;">' + orderStatus + '</strong></div>' +
                '</div></td></tr></table>' +
              '<table width="100%" style="border-collapse:collapse;margin-bottom:18px;font-size:12px;">' +
                '<thead><tr style="background:#f1f5f9;border-top:1px solid #e2e8f0;border-bottom:2px solid #cbd5e1;color:#475569;font-size:11px;">' +
                  '<th style="padding:10px;text-align:left;width:7%;">নং</th><th style="padding:10px;text-align:left;width:53%;">পণ্য বিবরণ</th><th style="padding:10px;text-align:center;width:12%;">পরিমাণ</th><th style="padding:10px;text-align:right;width:14%;">দর</th><th style="padding:10px;text-align:right;width:14%;">মোট</th>' +
                '</tr></thead><tbody>' + itemsRows + '</tbody></table>' +
              '<table width="100%" style="border-collapse:collapse;margin-bottom:16px;"><tr>' +
                '<td style="width:50%;vertical-align:top;"><div style="font-size:9px;font-weight:800;color:#94a3b8;letter-spacing:1px;margin-bottom:5px;">BARCODE TRACKER</div>' +
                  '<table style="background:#fff;border:1px solid #cbd5e1;border-radius:6px;padding:5px 8px;"><tr>' + barcodeBars + '</tr></table>' +
                  '<div style="font-family:monospace;font-size:10px;font-weight:800;color:#334155;margin-top:4px;">' + orderId + '</div></td>' +
                '<td style="width:50%;vertical-align:top;"><table width="100%" style="border-collapse:collapse;font-size:12.5px;">' +
                  '<tr><td style="padding:5px 0;color:#475569;">সাবটোটাল:</td><td style="padding:5px 0;text-align:right;font-weight:700;color:#0f172a;font-family:monospace;">' + formatBdt(subtotal) + '</td></tr>' +
                  '<tr><td style="padding:5px 0;color:#475569;">ডেলিভারি চার্জ:</td><td style="padding:5px 0;text-align:right;font-weight:700;color:#059669;font-family:monospace;">' + (deliveryFee === 0 ? 'ফ্রি (৳০)' : formatBdt(deliveryFee)) + '</td></tr>' +
                  '<tr style="border-top:2px solid #cbd5e1;"><td style="padding:8px 0 4px;font-size:14px;font-weight:900;color:#0f172a;">সর্বমোট:</td><td style="padding:8px 0 4px;text-align:right;font-size:18px;font-weight:900;color:#059669;font-family:monospace;">' + formatBdt(totalAmount) + '</td></tr>' +
                '</table></td></tr></table>' +
              '<div style="text-align:center;border-top:1px dashed #cbd5e1;padding-top:12px;">' +
                '<div style="font-size:12px;font-weight:700;color:#059669;margin-bottom:10px;">✨ ড্রিম কার্ট বিডি-র সাথে কেনাকাটা করার জন্য ধন্যবাদ!</div>' +
                (!isForPdf ? '<a href="https://dreamcartbd.com/order-success?orderId=' + encodeURIComponent(orderId) + '" target="_blank" style="display:inline-block;background:#059669;color:#fff;font-size:13px;font-weight:800;padding:10px 26px;border-radius:9999px;text-decoration:none;">🖨️ ভাউচার প্রিন্ট / ডাউনলোড</a>' : '') +
              '</div>' +
            '</div></td></tr></table></td></tr></table></body></html>';
  }

  /**
   * অর্ডারের জন্য ভাউচার পিডিএফ ব্লব তৈরি করে
   * @param {Object} order 
   * @returns {Blob}
   */
  function generateVoucherPdfBlob(order) {
    var orderId = order.orderId || order.order_id || "ORD-000000";
    var voucherHtml = generateModernEmailTemplate(order, true);
    return Utilities.newBlob(voucherHtml, "text/html", "Voucher_" + orderId + ".html")
      .getAs("application/pdf")
      .setName("Voucher_" + orderId + ".pdf");
  }

  return {
    createOrder: createOrder,
    sendOrderNotificationAsync: sendOrderNotificationAsync,
    generateModernEmailTemplate: generateModernEmailTemplate,
    generateVoucherPdfBlob: generateVoucherPdfBlob
  };

})();
