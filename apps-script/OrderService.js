/**
 * Dream Cart BD - Order Service
 * Manages order creation, retrieval, status updates, PDF voucher generation, and fast email dispatches.
 */

var OrderService = (function() {

  /**
   * মূল অ্যাডমিন ইমেইল প্রাপকদের তালিকা
   */
  var ADMIN_EMAILS = "jainal.dcitbd@gmail.com, saiful05333@gmail.com";

  /**
   * সংখ্যাকে টাকার ফরম্যাটে (৳১,২০০) রূপান্তর করে
   * @param {number|string} num 
   * @returns {string}
   */
  function formatBdt(num) {
    var n = Number(num || 0);
    if (isNaN(n)) n = 0;
    return "৳" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * অর্ডারের আইটেম তালিকা প্রসেস করে (অ্যারে বা টেক্সট স্ট্রিং উভয় থেকেই)
   * @param {Object} orderData 
   * @param {number} totalAmt 
   * @param {number} defaultQty 
   * @returns {Array}
   */
  function parseItemsFromOrder(orderData, totalAmt, defaultQty) {
    if (orderData && Array.isArray(orderData.items) && orderData.items.length > 0) {
      return orderData.items.map(function(it) {
        return {
          name: String(it.name || it.p_name || it.title || "পণ্য"),
          color: String(it.color || ""),
          size: String(it.size || ""),
          variant: String(it.variant || it.selectedVariant || ""),
          quantity: Number(it.quantity || it.qty || 1) || 1,
          price: Number(it.price || it.selling_price || it.unit_price || 0)
        };
      });
    }

    var rawProds = String((orderData && (orderData.Products || orderData.products || orderData.product_name)) || "");
    if (rawProds) {
      var parts = rawProds.split(/\s*\|\s*/).filter(Boolean);
      if (parts.length > 0) {
        return parts.map(function(pStr) {
          var qtyMatch = pStr.match(/x(\d+)\s*$/i);
          var qty = qtyMatch ? Number(qtyMatch[1]) : (Number(defaultQty) || 1);
          var cleanName = pStr.replace(/\s*x\d+\s*$/i, "").trim();
          var unitPrice = parts.length === 1 ? Math.round(Number(totalAmt || 0) / Math.max(1, qty)) : 0;
          return {
            name: cleanName || "পণ্য",
            color: String((orderData && (orderData.Color || orderData.color)) || ""),
            size: String((orderData && (orderData.Size || orderData.size)) || ""),
            variant: "",
            quantity: qty,
            price: unitPrice
          };
        });
      }
    }

    return [{
      name: "পণ্য সমাহার",
      color: String((orderData && (orderData.Color || orderData.color)) || ""),
      size: String((orderData && (orderData.Size || orderData.size)) || ""),
      variant: "",
      quantity: Number(defaultQty) || 1,
      price: Number(totalAmt || 0)
    }];
  }

  /**
   * নতুন অর্ডার তৈরি এবং দ্রুত রেসপন্স প্রদান
   * (createOrder(orderData) এবং Router.js এর createOrder(session, payload) উভয়ই সাপোর্ট করে)
   * @param {Object} arg1 
   * @param {Object} [arg2] 
   * @returns {Object}
   */
  function createOrder(arg1, arg2) {
    var orderData = (arg2 !== undefined && arg2 !== null) ? arg2 : arg1;
    if (!orderData) {
      throw new Error("অর্ডারের তথ্য পাওয়া যায়নি।");
    }

    // ১. অর্ডার আইডি ও ট্র্যাকিং কোড জেনারেশন
    var orderId = orderData.orderId || orderData.order_id || orderData.OrderID || (
      (typeof IDGenerator !== 'undefined' && IDGenerator.generateOrderId)
        ? IDGenerator.generateOrderId()
        : ((typeof IDGenerator !== 'undefined' && IDGenerator.orderID)
            ? IDGenerator.orderID()
            : 'ORD-' + Math.floor(100000 + Math.random() * 900000))
    );

    var orderNumber = orderId;
    var createdAt = orderData.date || orderData.Date || orderData.createdAt || new Date().toISOString();
    var customerName = orderData.customer_name || orderData.Customer_Name || orderData.name || orderData.customerName || "সম্মানিত গ্রাহক";
    var customerPhone = orderData.phone || orderData.Phone || orderData.customerPhone || "";
    var customerAddress = orderData.address || orderData.Address || orderData.shippingAddress || "";
    var deliveryArea = orderData.deliveryArea || orderData.city || "Regular";
    var total = Number(orderData.total_amount !== undefined ? orderData.total_amount : (orderData.Total_Amount !== undefined ? orderData.Total_Amount : (orderData.total || 0)));
    var defaultQty = Number(orderData.quantity || orderData.Quantity || 1) || 1;
    var items = parseItemsFromOrder(orderData, total, defaultQty);

    var calcSubtotal = 0;
    for (var i = 0; i < items.length; i++) {
      calcSubtotal += Number(items[i].price || 0) * Number(items[i].quantity || 1);
    }

    var subtotal = Number(orderData.subtotal !== undefined && orderData.subtotal > 0 ? orderData.subtotal : (calcSubtotal > 0 ? calcSubtotal : total));
    var deliveryCharge = orderData.delivery_fee !== undefined
      ? Number(orderData.delivery_fee)
      : (orderData.deliveryCharge !== undefined
          ? Number(orderData.deliveryCharge)
          : (orderData.shippingFee !== undefined
              ? Number(orderData.shippingFee)
              : (subtotal >= 2000 ? 0 : Math.max(0, total - subtotal))));
    var discount = Number(orderData.discount || orderData.online_discount || orderData.coupon_discount || 0);
    if (total <= 0) {
      total = Math.max(0, subtotal + deliveryCharge - discount);
    }

    var paymentMethod = orderData.payment_method || orderData.Payment_method || orderData.paymentMethod || "Cash On Delivery (COD)";
    var isCod = String(paymentMethod).toLowerCase().indexOf('cod') !== -1 || String(paymentMethod).toLowerCase().indexOf('cash') !== -1 || String(paymentMethod).indexOf('ক্যাশ') !== -1;
    var paymentStatus = orderData.payment_status || orderData.Payment_Status || (isCod ? "COD" : "Paid");
    var orderStatus = orderData.order_status || orderData.Order_Status || orderData.status || "Order Placed";
    var transactionId = orderData.transaction_id || orderData.Transaction_ID || orderData.trxId || "N/A";
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
      products: orderData.products || orderData.Products || "",
      color: orderData.color || orderData.Color || "Standard",
      size: orderData.size || orderData.Size || "Free Size",
      quantity: defaultQty,
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
      customer_note: note,
      status: orderStatus,
      order_status: orderStatus
    };

    // ২. শীটে অর্ডার রেকর্ড সংরক্ষণ
    try {
      if (typeof handleOrderCreation === 'function' && typeof getActiveSs === 'function') {
        handleOrderCreation(getActiveSs(orderData), completeOrder);
      } else if (typeof SheetRepository !== 'undefined' && SheetRepository.saveOrder) {
        SheetRepository.saveOrder(completeOrder);
      } else if (typeof Database !== 'undefined' && Database.insert) {
        Database.insert("Orders", completeOrder);
      }
    } catch (dbError) {
      Logger.log("Database Save Error: " + dbError.toString());
    }

    // ৩. মেইল এবং পিডিএফ ভাউচার প্রেরণ (যদি handleOrderCreation ইতিমধ্যে না পাঠিয়ে থাকে)
    if (typeof handleOrderCreation !== 'function') {
      try {
        sendOrderNotificationAsync(completeOrder);
      } catch (mailError) {
        Logger.log("Order Notification Error: " + mailError.toString());
      }
    }

    // ৪. তাৎক্ষণিক ফ্রন্টএন্ডে ভাউচার ডেটা রিটার্ন (কাস্টমার যেন সাথে সাথে রেজাল্ট পায়)
    return {
      success: true,
      message: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!",
      orderId: orderId,
      order_id: orderId,
      order: completeOrder
    };
  }

  /**
   * অর্ডারের বিস্তারিত তথ্য অনুসন্ধান (Router.js এর সাথে সামঞ্জস্যপূর্ণ)
   * @param {Object|string} arg1 
   * @param {string} [arg2] 
   * @returns {Object|null}
   */
  function getOrderDetails(arg1, arg2) {
    var targetOrderId = (arg2 !== undefined && arg2 !== null) ? arg2 : arg1;
    if (targetOrderId && typeof targetOrderId === 'object') {
      targetOrderId = targetOrderId.order_id || targetOrderId.orderId || targetOrderId.OrderID || "";
    }
    var cleanId = String(targetOrderId || "").trim().toLowerCase();
    if (!cleanId) return null;

    try {
      if (typeof SheetRepository !== 'undefined' && SheetRepository.findOne) {
        return SheetRepository.findOne("Orders", function(r) {
          var rId = String(r.OrderID || r.order_id || r.orderId || "").trim().toLowerCase();
          return rId === cleanId;
        });
      }
    } catch (e) {
      Logger.log("getOrderDetails Error: " + e.toString());
    }
    return null;
  }

  /**
   * অর্ডারের স্ট্যাটাস আপডেট (Router.js এর সাথে সামঞ্জস্যপূর্ণ)
   * @param {Object|string} sessionOrId 
   * @param {string} orderIdOrStatus 
   * @param {string} [status] 
   * @param {string} [note] 
   * @returns {Object}
   */
  function updateStatus(sessionOrId, orderIdOrStatus, status, note) {
    var orderId = status !== undefined ? orderIdOrStatus : sessionOrId;
    var newStatus = status !== undefined ? status : orderIdOrStatus;

    try {
      if (typeof handleOrderStatusUpdate === 'function' && typeof getActiveSs === 'function') {
        return handleOrderStatusUpdate(getActiveSs(), {
          order_id: orderId,
          order_status: newStatus,
          status: newStatus,
          note: note || ""
        });
      }
      if (typeof SheetRepository !== 'undefined' && SheetRepository.updateRowByCondition) {
        SheetRepository.updateRowByCondition("Orders", function(r) {
          var rId = String(r.OrderID || r.order_id || r.orderId || "").trim().toLowerCase();
          return rId === String(orderId || "").trim().toLowerCase();
        }, { Order_Status: newStatus, order_status: newStatus });
      }
    } catch (e) {
      Logger.log("updateStatus Error: " + e.toString());
    }

    return {
      success: true,
      order_id: orderId,
      status: newStatus,
      message: "অর্ডার স্ট্যাটাস আপডেট হয়েছে!"
    };
  }

  /**
   * অ্যাডমিনদের (jainal.dcitbd@gmail.com & saiful05333@gmail.com) কাছে
   * হুবহু অফিশিয়াল ইনভয়েস ভাউচার মেইল ও পিডিএফ প্রেরণ
   * @param {Object} order 
   */
  function sendOrderNotificationAsync(order) {
    var orderId = order.orderId || order.order_id || "ORD-000000";
    var customerName = order.customerName || order.customer_name || "গ্রাহক";
    var totalAmt = Number(order.total || order.total_amount || 0);
    var subject = "🛒 [নতুন অর্ডার ভাউচার] " + orderId + " — " + customerName + " (৳" + totalAmt + ")";

    var htmlBody = generateModernEmailTemplate(order, false);

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
      name: "Dream Cart BD Official Invoice"
    };

    if (pdfBlob) {
      mailOptions.attachments = [pdfBlob];
    }

    // সমান্তরালভাবে দুটি অ্যাডমিন ঠিকানায় মেইল ও পিডিএফ পাঠানো
    MailApp.sendEmail(mailOptions);
  }

  /**
   * আপনার দেওয়া ছবির হুবহু অফিশিয়াল ইনভয়েস ভাউচার HTML মেইল টেমপ্লেট
   * (সাদা পেপার ইনভয়েস, ওয়াটারমার্ক লোগো, বারকোড ট্র্যাকার ও আধুনিক সিএসএস ডিজাইন)
   * @param {Object} order 
   * @param {boolean} [isForPdf] 
   * @returns {string}
   */
  function generateModernEmailTemplate(order, isForPdf) {
    var orderId = String(order.orderId || order.order_id || order.OrderID || "ORD-000000").trim();
    var dateStr = String(order.date || order.Date || order.createdAt || "").trim();
    try {
      if (dateStr && dateStr.indexOf("T") !== -1) {
        dateStr = Utilities.formatDate(new Date(dateStr), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
      }
    } catch (e) {}
    if (!dateStr) {
      dateStr = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
    }

    var customerName = String(order.customerName || order.customer_name || order.Customer_Name || order.name || "সম্মানিত গ্রাহক").trim();
    var customerPhone = String(order.customerPhone || order.phone || order.Phone || "01700000000").trim();
    var customerAddress = String(order.customerAddress || order.address || order.Address || "বাংলাদেশ").trim();
    var paymentMethod = String(order.paymentMethod || order.payment_method || order.Payment_method || "Cash On Delivery (COD)").trim();
    var isCod = paymentMethod.toLowerCase().indexOf("cod") !== -1 || paymentMethod.toLowerCase().indexOf("cash") !== -1 || paymentMethod.indexOf("ক্যাশ") !== -1;
    var rawPayStatus = String(order.payment_status || order.Payment_Status || (isCod ? "COD" : "Paid")).trim();
    var isPaid = rawPayStatus.toLowerCase() === "paid";
    var orderStatus = String(order.order_status || order.Order_Status || order.status || "Order Placed").trim();
    var trxId = String(order.transaction_id || order.Transaction_ID || "").trim();
    var customerNote = String(order.customer_note || order.note || order.notes || "").trim();

    var defaultQty = Number(order.quantity || order.Quantity || 1) || 1;
    var totalAmount = Number(order.total !== undefined ? order.total : (order.total_amount !== undefined ? order.total_amount : (order.Total_Amount || 0)));
    var items = parseItemsFromOrder(order, totalAmount, defaultQty);

    var calcSubtotal = 0;
    for (var i = 0; i < items.length; i++) {
      calcSubtotal += Number(items[i].price || 0) * Number(items[i].quantity || 1);
    }

    var subtotal = Number(order.subtotal !== undefined && order.subtotal > 0 ? order.subtotal : (calcSubtotal > 0 ? calcSubtotal : totalAmount));
    if (totalAmount <= 0 && subtotal > 0) {
      totalAmount = subtotal;
    }

    var deliveryFee = order.deliveryCharge !== undefined
      ? Number(order.deliveryCharge)
      : (order.delivery_fee !== undefined
          ? Number(order.delivery_fee)
          : (subtotal >= 2000 ? 0 : Math.max(0, totalAmount - subtotal)));

    var discountAmt = Number(order.discount || order.online_discount || order.coupon_discount || 0);
    if (discountAmt <= 0 && (subtotal + deliveryFee > totalAmount)) {
      discountAmt = (subtotal + deliveryFee) - totalAmount;
    }

    var itemsRowsHtml = "";
    items.forEach(function(it, idx) {
      var itemName = it.name || it.title || "পণ্য";
      var qty = Number(it.quantity || it.qty || 1);
      var price = Number(it.price || 0);
      var itemTotal = qty * price;

      var variantParts = [];
      if (it.color && String(it.color).toLowerCase() !== "standard") variantParts.push(it.color);
      if (it.size && String(it.size).toLowerCase() !== "free size" && String(it.size).toLowerCase() !== "std") variantParts.push(it.size);
      if (variantParts.length === 0 && (it.variant || it.selectedVariant)) variantParts.push(it.variant || it.selectedVariant);

      var hasParenInName = itemName.indexOf("(") !== -1 && itemName.indexOf(")") !== -1;
      var variantBadge = (variantParts.length > 0 && !hasParenInName)
        ? ' <span style="font-size: 11px; color: #059669; font-weight: 500; margin-left: 4px;">(' + variantParts.join(", ") + ')</span>'
        : '';

      itemsRowsHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 10px; color: #64748b; font-size: 12px; vertical-align: middle;">${idx + 1}</td>
          <td style="padding: 12px 10px; color: #0f172a; font-size: 12px; font-weight: 700; line-height: 1.45; vertical-align: middle;">
            ${itemName}${variantBadge}
          </td>
          <td style="padding: 12px 10px; text-align: center; color: #0f172a; font-size: 12px; font-weight: 800; vertical-align: middle;">${qty}</td>
          <td style="padding: 12px 10px; text-align: right; color: #334155; font-size: 12px; font-family: monospace; vertical-align: middle;">${formatBdt(price)}</td>
          <td style="padding: 12px 10px; text-align: right; color: #0f172a; font-size: 12px; font-weight: 800; font-family: monospace; vertical-align: middle;">${formatBdt(itemTotal)}</td>
        </tr>
      `;
    });

    var barcodeBarsHtml = "";
    for (var b = 0; b < 28; b++) {
      var barWidth = (b % 3 === 0) ? "3px" : "1.5px";
      barcodeBarsHtml += `<td style="padding: 0 1px;"><div style="height: 24px; width: ${barWidth}; background-color: #0f172a;"></div></td>`;
    }

    var payBadgeStyle = isPaid
      ? "background-color: #d1fae5; color: #065f46;"
      : "background-color: #fef3c7; color: #92400e;";

    var siteOrderUrl = "https://dreamcartbd.com/order-success?orderId=" + encodeURIComponent(orderId);
    var logoUrl = "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg";

    return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Official Invoice - ${orderId} - Dream Cart BD</title>
    </head>
    <body style="margin: 0; padding: ${isForPdf ? '0' : '24px 12px'}; background-color: ${isForPdf ? '#ffffff' : '#f1f5f9'}; font-family: 'Plus Jakarta Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${isForPdf ? '#ffffff' : '#f1f5f9'};">
        <tr>
          <td align="center">
            <!-- মূল সাদা পেপার ইনভয়েস ভাউচার কার্ড -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; width: 100%; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); position: relative;">
              <tr>
                <td style="padding: 28px 30px; position: relative; background-image: url('${logoUrl}'); background-repeat: no-repeat; background-position: center center; background-size: 240px;">
                  <div style="background-color: rgba(255, 255, 255, 0.93); padding: 4px; border-radius: 12px;">
                    
                    <!-- ১. হেডার সেকশন (লোগো, শপের নাম, ঠিকানা ও ইনভয়েস ব্যাজ) -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 18px;">
                      <tr>
                        <td style="vertical-align: top; width: 62%; padding-bottom: 14px;">
                          <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                            <tr>
                              <td style="vertical-align: top; padding-right: 12px; width: 58px;">
                                <img 
                                  src="${logoUrl}" 
                                  alt="Dream Cart BD" 
                                  width="52" 
                                  height="52" 
                                  style="width: 52px; height: 52px; object-fit: contain; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2px; background-color: #ffffff; display: block;" 
                                />
                              </td>
                              <td style="vertical-align: top;">
                                <div style="font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.2;">
                                  Dream Cart <span style="color: #059669;">BD</span>
                                </div>
                                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 3px;">
                                  SMART DIGITAL COMMERCE PLATFORM
                                </div>
                                <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.45;">
                                  চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা।<br/>
                                  হটলাইন: <strong style="color: #0f172a;">01581703822, 01818273838</strong>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="vertical-align: top; text-align: right; width: 38%; padding-bottom: 14px;">
                          <div style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                            OFFICIAL INVOICE
                          </div>
                          <div style="font-size: 13px; font-weight: 700; color: #334155;">
                            Order ID: <span style="font-family: monospace; font-size: 15px; font-weight: 900; color: #059669;">${orderId}</span>
                          </div>
                          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
                            তারিখ: <span style="color: #334155; font-weight: 600;">${dateStr}</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- ২. গ্রাহকের বিবরণ ও পেমেন্ট বিবরণ (পাশাপাশি দুটি বক্স) -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 18px;">
                      <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; min-height: 92px;">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px; margin-bottom: 6px;">
                              গ্রাহকের বিবরণ:
                            </div>
                            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                              ${customerName}
                            </div>
                            <div style="font-size: 11.5px; color: #475569; margin-bottom: 4px;">
                              📞 মোবাইল: <a href="tel:${customerPhone}" style="color: #0f172a; font-weight: 800; font-family: monospace; text-decoration: none;">${customerPhone}</a>
                            </div>
                            <div style="font-size: 11.5px; color: #475569; line-height: 1.45;">
                              📍 ঠিকানা: <span style="color: #1e293b;">${customerAddress}</span>
                            </div>
                            ${customerNote && customerNote !== 'N/A' ? `
                            <div style="font-size: 11px; color: #b45309; margin-top: 4px;">
                              📝 নোট: ${customerNote}
                            </div>` : ''}
                          </div>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; min-height: 92px;">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px; margin-bottom: 6px;">
                              পেমেন্ট বিবরণ:
                            </div>
                            <div style="font-size: 11.5px; color: #475569; margin-bottom: 5px;">
                              মেথড: <strong style="color: #0f172a;">${paymentMethod}</strong>
                            </div>
                            ${trxId && trxId !== 'N/A' && trxId !== 'COD' ? `
                            <div style="font-size: 11px; color: #475569; margin-bottom: 5px;">
                              TrxID: <strong style="color: #0f172a; font-family: monospace;">${trxId}</strong>
                            </div>` : ''}
                            <div style="font-size: 11.5px; color: #475569; margin-bottom: 5px;">
                              পেমেন্ট স্ট্যাটাস: <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; ${payBadgeStyle}">${rawPayStatus}</span>
                            </div>
                            <div style="font-size: 11.5px; color: #475569;">
                              অর্ডার স্ট্যাটাস: <strong style="color: #059669;">${orderStatus}</strong>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- ৩. পণ্যের বিবরণী টেবিল -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px;">
                      <thead>
                        <tr style="background-color: #f1f5f9; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 11px; text-transform: uppercase;">
                          <th style="padding: 10px; text-align: left; width: 7%; font-weight: 800;">নং</th>
                          <th style="padding: 10px; text-align: left; width: 53%; font-weight: 800;">পণ্য বিবরণ</th>
                          <th style="padding: 10px; text-align: center; width: 12%; font-weight: 800;">পরিমাণ</th>
                          <th style="padding: 10px; text-align: right; width: 14%; font-weight: 800;">দর</th>
                          <th style="padding: 10px; text-align: right; width: 14%; font-weight: 800;">মোট</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsRowsHtml}
                      </tbody>
                    </table>

                    <!-- ৪. বারকোড ট্র্যাকার ও সর্বমোট হিসাব -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                      <tr>
                        <td style="width: 50%; vertical-align: top;">
                          <div style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                            BARCODE TRACKER
                          </div>
                          <table border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px;">
                            <tr>
                              ${barcodeBarsHtml}
                            </tr>
                          </table>
                          <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #334155; margin-top: 4px;">
                            ${orderId}
                          </div>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                            <tr>
                              <td style="padding: 5px 0; color: #475569;">সাবটোটাল:</td>
                              <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${formatBdt(subtotal)}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #475569;">ডেলিভারি চার্জ:</td>
                              <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #059669; font-family: monospace;">${deliveryFee === 0 ? 'ফ্রি (৳০)' : formatBdt(deliveryFee)}</td>
                            </tr>
                            ${discountAmt > 0 ? `
                            <tr>
                              <td style="padding: 5px 0; color: #dc2626;">ডিসকাউন্ট ছাড়:</td>
                              <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #dc2626; font-family: monospace;">-${formatBdt(discountAmt)}</td>
                            </tr>` : ''}
                            <tr style="border-top: 2px solid #cbd5e1;">
                              <td style="padding: 8px 0 4px; font-size: 14px; font-weight: 900; color: #0f172a;">সর্বমোট:</td>
                              <td style="padding: 8px 0 4px; text-align: right; font-size: 18px; font-weight: 900; color: #059669; font-family: monospace;">${formatBdt(totalAmount)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- ৫. ফুটার মেসেজ ও প্রিন্ট/ডাউনলোড বাটন -->
                    <div style="text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 6px;">
                      <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 12px;">
                        ✨ ড্রিম কার্ট বিডি-র সাথে কেনাকাটা করার জন্য ধন্যবাদ!
                      </div>
                      ${!isForPdf ? `
                      <div style="margin-top: 8px;">
                        <a 
                          href="${siteOrderUrl}" 
                          target="_blank" 
                          style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 13px; font-weight: 800; padding: 10px 26px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);"
                        >
                          🖨️ ভাউচার প্রিন্ট / ডাউনলোড
                        </a>
                      </div>` : ''}
                    </div>

                  </div>
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
   * অর্ডারের জন্য হুবহু অফিশিয়াল ইনভয়েস ভাউচার পিডিএফ ব্লব তৈরি করে
   * @param {Object} order 
   * @returns {Blob}
   */
  function generateVoucherPdfBlob(order) {
    var orderId = order.orderId || order.order_id || order.OrderID || "ORD-000000";
    var voucherHtml = generateModernEmailTemplate(order, true);

    return Utilities.newBlob(voucherHtml, "text/html", "Voucher_" + orderId + ".html")
      .getAs("application/pdf")
      .setName("Voucher_" + orderId + ".pdf");
  }

  return {
    createOrder: createOrder,
    getOrderDetails: getOrderDetails,
    updateStatus: updateStatus,
    sendOrderNotificationAsync: sendOrderNotificationAsync,
    generateModernEmailTemplate: generateModernEmailTemplate,
    generateVoucherPdfBlob: generateVoucherPdfBlob
  };

})();

if (typeof module !== 'undefined') {
  module.exports = OrderService;
}
