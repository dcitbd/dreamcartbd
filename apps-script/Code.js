/**
 * DREAM CART BD — MASTER GOOGLE APPS SCRIPT API GATEWAY (Code.js)
 * Connected Google Spreadsheet ID: 1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8
 * Live Web App Gateway: https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec
 * Lead Developer: Jainal Abedin (CEO, Dream Career IT BD)
 * Notifications: jainal.dcitbd@gmail.com
 */

var SPREADSHEET_ID = "1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8";
var NOTIFICATION_EMAIL = "jainal.dcitbd@gmail.com";

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  var action = "";
  var payload = {};
  var callback = "";

  if (e && e.parameter) {
    if (e.parameter.action) action = e.parameter.action;
    if (e.parameter.callback) callback = e.parameter.callback;

    if (e.parameter.data) {
      try {
        payload = JSON.parse(e.parameter.data);
      } catch (err) {
        payload = e.parameter;
      }
    } else if (e.parameter.payload) {
      try {
        payload = JSON.parse(e.parameter.payload);
      } catch (err) {
        payload = e.parameter;
      }
    } else {
      payload = e.parameter;
    }
  }

  if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      if (parsed.action) action = parsed.action;
      if (parsed.payload && typeof parsed.payload === "object") payload = parsed.payload;
      else if (parsed.data && typeof parsed.data === "object") payload = parsed.data;
      else if (typeof parsed.payload === "string") payload = JSON.parse(parsed.payload);
      else if (typeof parsed.data === "string") payload = JSON.parse(parsed.data);
      else payload = parsed;
    } catch (err) {
      // Handle application/x-www-form-urlencoded POST body if e.parameter didn't parse it
      if (!payload || Object.keys(payload).length === 0) {
        payload = e.parameter || {};
      }
      if (typeof payload.payload === "string") {
        try { payload = JSON.parse(payload.payload); } catch (e2) {}
      } else if (typeof payload.data === "string") {
        try { payload = JSON.parse(payload.data); } catch (e3) {}
      }
    }
  }

  if (!action) action = "system/health";

  var responseObj;
  try {
    responseObj = dispatchAction(action, payload);
  } catch (err) {
    responseObj = { status: "error", success: false, message: err.toString() };
  }

  if (callback) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(responseObj) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}

function dispatchAction(action, payload) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  switch (action) {
    case "system/health":
      return { status: "success", success: true, message: "Dream Cart BD Gateway Active!", time: new Date().toISOString() };

    case "setup":
    case "system/setup":
      return setupAllSystemSheets();

    case "products/list":
      return getSheetDataAsJson(ss, "Products");

    case "products/add":
    case "products/create":
      return handleProductCreation(ss, payload);

    case "products/delete":
      return handleProductDelete(ss, payload);

    case "categories/list":
      return getSheetDataAsJson(ss, "Categories");

    case "categories/add":
    case "categories/create":
      return handleCategoryCreation(ss, payload);

    case "categories/delete":
      return handleCategoryDelete(ss, payload);

    case "brands/list":
      return getSheetDataAsJson(ss, "Brands");

    case "brands/add":
    case "brands/create":
      return handleBrandCreation(ss, payload);

    case "brands/delete":
      return handleBrandDelete(ss, payload);

    case "orders/list":
      return getSheetDataAsJson(ss, "Orders");

    case "orders/create":
      return handleOrderCreation(ss, payload);

    case "orders/update_status":
      return handleOrderStatusUpdate(ss, payload);

    case "incomplete_orders/list":
      return getSheetDataAsJson(ss, "Incomplete_Orders");

    case "incomplete_orders/create":
      return handleIncompleteOrder(ss, payload);

    case "viewers/list":
      return getSheetDataAsJson(ss, "Viewers");

    case "viewers/log":
      return logViewerActivity(ss, payload);

    case "settings/list":
      return getSheetDataAsJson(ss, "Settings");

    case "settings/update":
      return handleSettingsUpdate(ss, payload);

    case "banners/list":
      return getSheetDataAsJson(ss, "Banners");

    case "banners/add":
      return handleBannerAdd(ss, payload);

    case "reviews/list":
      return getSheetDataAsJson(ss, "Reviews");

    case "reviews/add":
      return handleReviewAdd(ss, payload);

    case "customers/list":
      return getSheetDataAsJson(ss, "Customers");

    case "customers/login":
      return handleCustomerLogin(ss, payload);

    case "customers/register":
    case "customers/create":
    case "customers/add":
      return handleCustomerRegistration(ss, payload);

    default:
      return { status: "success", success: true, message: "Action executed: " + action };
  }
}

function handleProductCreation(ss, payload) {
  var sheet = ss.getSheetByName("Products");
  if (!sheet) {
    sheet = ss.insertSheet("Products");
    sheet.appendRow([
      "SKU", "P_Name", "Category", "Sub_Category", "Child_Category", "Brand",
      "Buying_price", "Selling_Price", "Stock", "Original_Price", "WholeSale_price",
      "Min_order_Q", "Images", "Slug", "Description", "Specification", "Others",
      "Color", "Size", "WEIGHT_KG", "WIDTH_CM", "LENGTH_CM", "HEIGHT_CM"
    ]);
  }

  var sku = payload.sku || ("DCBD-" + Math.floor(1000 + Math.random() * 9000));
  var name = payload.name || payload.p_name || "নতুন পণ্য";
  var slug = payload.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  var imagesStr = Array.isArray(payload.images) ? payload.images.join(", ") : (payload.images || payload.thumbnail || "");

  var row = [
    sku,
    name,
    payload.category || "General",
    payload.sub_category || "",
    payload.child_category || "",
    payload.brand || "Dream Cart BD",
    Number(payload.buying_price || 0),
    Number(payload.selling_price || 0),
    Number(payload.stock || 10),
    Number(payload.original_price || payload.selling_price || 0),
    Number(payload.wholesale_price || Math.round((payload.selling_price || 0) * 0.85)),
    Number(payload.min_order_q || payload.min_order_qty || 1),
    imagesStr,
    slug,
    payload.description || "",
    payload.specification || "",
    payload.others || "",
    payload.color || "",
    payload.size || "",
    Number(payload.weight_kg || 0.25),
    Number(payload.width_cm || 10),
    Number(payload.length_cm || 10),
    Number(payload.height_cm || 5)
  ];

  sheet.appendRow(row);
  return { status: "success", success: true, message: "Product added to Sheet!", data: { sku: sku, slug: slug } };
}

function handleProductDelete(ss, payload) {
  var sheet = ss.getSheetByName("Products");
  if (!sheet) return { status: "error", message: "Sheet not found" };
  var data = sheet.getDataRange().getValues();
  var idToDelete = String(payload.id || payload.sku || payload.slug).toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === idToDelete || String(data[i][13]).toLowerCase() === idToDelete) {
      sheet.deleteRow(i + 1);
      return { status: "success", success: true, message: "Product deleted" };
    }
  }
  return { status: "error", message: "Product not found" };
}

function handleCategoryCreation(ss, payload) {
  var sheet = ss.getSheetByName("Categories");
  if (!sheet) {
    sheet = ss.insertSheet("Categories");
    sheet.appendRow(["Catagory_ID", "Catagory_Slug", "Category_Image", "Category", "Sub_Category", "Chail_Category"]);
  }

  var catId = payload.catagory_id || payload.id || ("CAT-" + Math.floor(1000 + Math.random() * 9000));
  var catName = payload.category || payload.name || "Category";
  var slug = payload.catagory_slug || payload.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  var row = [
    catId,
    slug,
    payload.category_image || payload.image || "",
    catName,
    payload.sub_category || "",
    payload.chail_category || payload.child_category || ""
  ];

  sheet.appendRow(row);
  return { status: "success", success: true, message: "Category added to Sheet!", data: { catagory_id: catId, catagory_slug: slug } };
}

function handleCategoryDelete(ss, payload) {
  var sheet = ss.getSheetByName("Categories");
  if (!sheet) return { status: "error", message: "Sheet not found" };
  var data = sheet.getDataRange().getValues();
  var id = String(payload.id || payload.catagory_id || payload.category).toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === id || String(data[i][3]).toLowerCase() === id) {
      sheet.deleteRow(i + 1);
      return { status: "success", success: true, message: "Category deleted" };
    }
  }
  return { status: "error", message: "Category not found" };
}

function handleBrandCreation(ss, payload) {
  var sheet = ss.getSheetByName("Brands");
  if (!sheet) {
    sheet = ss.insertSheet("Brands");
    sheet.appendRow(["Brand_ID", "Brand_Image", "Brand_Name", "Brand_Slug", "Brand_Description"]);
  }

  var brandId = payload.brand_id || payload.id || ("BRD-" + Math.floor(1000 + Math.random() * 9000));
  var brandName = payload.brand_name || payload.name || "Brand";
  var slug = payload.brand_slug || payload.slug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  var row = [
    brandId,
    payload.brand_image || payload.image || "",
    brandName,
    slug,
    payload.brand_description || payload.description || ""
  ];

  sheet.appendRow(row);
  return { status: "success", success: true, message: "Brand added to Sheet!", data: { brand_id: brandId, brand_slug: slug } };
}

function handleBrandDelete(ss, payload) {
  var sheet = ss.getSheetByName("Brands");
  if (!sheet) return { status: "error", message: "Sheet not found" };
  var data = sheet.getDataRange().getValues();
  var id = String(payload.id || payload.brand_id || payload.brand_name).toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === id || String(data[i][2]).toLowerCase() === id) {
      sheet.deleteRow(i + 1);
      return { status: "success", success: true, message: "Brand deleted" };
    }
  }
  return { status: "error", message: "Brand not found" };
}

function handleOrderCreation(ss, payload) {
  var sheet = ss.getSheetByName("Orders") || ss.getSheetByName("Order");
  if (!sheet) {
    sheet = ss.insertSheet("Orders");
    sheet.appendRow([
      "Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address",
      "Products", "Color", "Size", "Quantity", "Total_Amount", "Payment_method",
      "Transaction_ID", "Payment_Status", "Order_Status", "Reseller_Commission", "Commission_Status"
    ]);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address",
      "Products", "Color", "Size", "Quantity", "Total_Amount", "Payment_method",
      "Transaction_ID", "Payment_Status", "Order_Status", "Reseller_Commission", "Commission_Status"
    ]);
    sheet.setFrozenRows(1);
  }

  var orderId = String(payload.order_id || payload.OrderID || payload.orderId || ("ORD-" + Math.floor(100000 + Math.random() * 900000))).trim();
  var dateStr = payload.date || payload.Date || Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

  var itemsArr = Array.isArray(payload.items) ? payload.items : [];
  var productsDesc = payload.products || payload.Products || payload.product_name || "";
  if (!productsDesc && itemsArr.length > 0) {
    productsDesc = itemsArr.map(function(item) {
      var v = [item.color, item.size].filter(Boolean).join(", ");
      return (item.name || item.p_name || "পণ্য") + (v ? " [" + v + "]" : "") + " (" + (item.quantity || 1) + "x)";
    }).join(", ");
  }
  if (!productsDesc) productsDesc = "পণ্য অর্ডার";

  var colorStr = payload.color || payload.Color || "";
  if (!colorStr && itemsArr.length > 0) {
    colorStr = itemsArr.map(function(i) { return i.color || ""; }).filter(Boolean).join(", ");
  }
  if (!colorStr) colorStr = "Standard";

  var sizeStr = payload.size || payload.Size || "";
  if (!sizeStr && itemsArr.length > 0) {
    sizeStr = itemsArr.map(function(i) { return i.size || ""; }).filter(Boolean).join(", ");
  }
  if (!sizeStr) sizeStr = "Free Size";

  var totalQty = Number(payload.quantity || payload.Quantity || 0);
  if (!totalQty && itemsArr.length > 0) {
    totalQty = itemsArr.reduce(function(acc, i) { return acc + (Number(i.quantity) || 1); }, 0);
  }
  if (!totalQty) totalQty = 1;

  var rawPhone = String(payload.phone || payload.Phone || payload.customer_phone || "").trim();
  if (rawPhone.length === 10 && rawPhone.charAt(0) === "1") rawPhone = "0" + rawPhone;

  var row = [
    dateStr,
    orderId,
    payload.account_type || payload.Account_type || "Customer",
    payload.customer_name || payload.Customer_Name || "গ্রাহক",
    rawPhone,
    payload.address || payload.Address || payload.shipping_address || "",
    productsDesc,
    colorStr,
    sizeStr,
    totalQty,
    Number(payload.total_amount || payload.Total_Amount || payload.grand_total || 0),
    payload.payment_method || payload.Payment_method || "Cash On Delivery (COD)",
    payload.transaction_id || payload.Transaction_ID || "N/A",
    payload.payment_status || payload.Payment_Status || "COD",
    payload.order_status || payload.Order_Status || "Order Placed",
    Number(payload.reseller_commission || payload.Reseller_Commission || 0),
    payload.commission_status || payload.Commission_Status || "Pending"
  ];

  sheet.appendRow(row);
  payload.products = productsDesc;
  payload.phone = rawPhone;
  sendOrderReminderEmail(orderId, payload, dateStr);

  return {
    status: "success",
    success: true,
    data: { order_id: orderId },
    message: "অর্ডার সফলভাবে শিটে জমা হয়েছে!"
  };
}

function handleOrderStatusUpdate(ss, payload) {
  var sheet = ss.getSheetByName("Orders") || ss.getSheetByName("Order");
  if (!sheet) return { status: "error", message: "Orders sheet not found" };

  var data = sheet.getDataRange().getValues();
  var orderId = String(payload.order_id || payload.orderId || payload.OrderID || "").trim();
  var newStatus = payload.order_status || payload.status;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === orderId) {
      if (newStatus) sheet.getRange(i + 1, 15).setValue(newStatus);
      if (payload.payment_status) sheet.getRange(i + 1, 14).setValue(payload.payment_status);
      else if (newStatus === "Delivered") sheet.getRange(i + 1, 14).setValue("Paid");
      return { status: "success", success: true, message: "Order status updated" };
    }
  }

  return { status: "error", message: "Order not found" };
}

function sendOrderReminderEmail(orderId, orderData, dateStr) {
  try {
    var recipient = NOTIFICATION_EMAIL;
    var subject = "🔔 [নতুন অর্ডার] " + orderId + " — " + (orderData.customer_name || "গ্রাহক") + " (৳" + (orderData.total_amount || 0) + ")";

    var htmlBody = "<div style=\"font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;\">" +
      "<div style=\"max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);\">" +
        "<div style=\"background: linear-gradient(135deg, #059669, #047857); padding: 20px; color: #ffffff; text-align: center;\">" +
          "<h2 style=\"margin: 0; font-size: 22px; font-weight: 900;\">Dream Cart BD</h2>" +
          "<p style=\"margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;\">স্মার্ট ডিজিটাল কমার্স — নতুন অর্ডার অ্যালার্ট</p>" +
        "</div>" +
        "<div style=\"padding: 24px;\">" +
          "<div style=\"border-bottom: 2px solid #ecfdf5; padding-bottom: 12px; margin-bottom: 16px;\">" +
            "<span style=\"background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;\">অর্ডার নিশ্চিতকরণ</span>" +
            "<h3 style=\"margin: 8px 0 0 0; font-size: 18px; color: #0f172a;\">অর্ডার আইডি: <span style=\"color: #059669;\">" + orderId + "</span></h3>" +
            "<p style=\"margin: 2px 0 0 0; font-size: 12px; color: #64748b;\">তারিখ ও সময়: " + dateStr + "</p>" +
          "</div>" +
          "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;\">" +
            "<tr style=\"background: #f8fafc; border-bottom: 1px solid #e2e8f0;\"><td style=\"padding: 10px; font-weight: bold; color: #475569; width: 35%;\">গ্রাহকের নাম:</td><td style=\"padding: 10px; font-weight: bold; color: #0f172a;\">" + (orderData.customer_name || 'N/A') + "</td></tr>" +
            "<tr style=\"border-bottom: 1px solid #e2e8f0;\"><td style=\"padding: 10px; font-weight: bold; color: #475569;\">মোবাইল নম্বর:</td><td style=\"padding: 10px; color: #059669; font-weight: bold; font-family: monospace;\">" + (orderData.phone || 'N/A') + "</td></tr>" +
            "<tr style=\"background: #f8fafc; border-bottom: 1px solid #e2e8f0;\"><td style=\"padding: 10px; font-weight: bold; color: #475569;\">ডেলিভারি ঠিকানা:</td><td style=\"padding: 10px; color: #334155;\">" + (orderData.address || 'N/A') + "</td></tr>" +
            "<tr style=\"background: #f8fafc; border-bottom: 1px solid #e2e8f0;\"><td style=\"padding: 10px; font-weight: bold; color: #475569;\">অ্যাকাউন্ট টাইপ:</td><td style=\"padding: 10px; color: #334155;\">" + (orderData.account_type || 'Customer') + "</td></tr>" +
            "<tr style=\"border-bottom: 1px solid #e2e8f0;\"><td style=\"padding: 10px; font-weight: bold; color: #475569;\">অর্ডারকৃত পণ্য:</td><td style=\"padding: 10px; color: #0f172a; font-weight: bold;\">" + (orderData.products || 'পণ্য') + "</td></tr>" +
            "<tr style=\"border-bottom: 1px solid #e2e8f0;\"><td style=\"padding: 10px; font-weight: bold; color: #475569;\">পেমেন্ট পদ্ধতি:</td><td style=\"padding: 10px; color: #334155;\">" + (orderData.payment_method || 'Cash On Delivery') + " (" + (orderData.payment_status || 'COD') + ")</td></tr>" +
            (orderData.transaction_id && orderData.transaction_id !== 'N/A' ? "<tr style=\"background: #f8fafc; border-bottom: 1px solid #e2e8f0;\"><td style=\"padding: 10px; font-weight: bold; color: #475569;\">TrxID:</td><td style=\"padding: 10px; font-family: monospace; color: #059669;\">" + orderData.transaction_id + "</td></tr>" : "") +
            "<tr style=\"background: #ecfdf5;\"><td style=\"padding: 12px 10px; font-weight: bold; color: #065f46; font-size: 15px;\">সর্বমোট প্রদেয়:</td><td style=\"padding: 12px 10px; font-weight: 900; color: #059669; font-size: 16px;\">৳" + (orderData.total_amount || 0) + "</td></tr>" +
          "</table>" +
          "<div style=\"text-align: center; margin-top: 24px;\">" +
            "<a href=\"https://wa.me/88" + orderData.phone + "\" style=\"display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 12px; margin-right: 8px;\">গ্রাহককে WhatsApp বার্তা পাঠান 💬</a>" +
            "<a href=\"tel:" + orderData.phone + "\" style=\"display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 12px;\">সরাসরি কল করুন 📞</a>" +
          "</div>" +
        "</div>" +
        "<div style=\"background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;\">" +
          "Dream Cart BD • চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা-৩৫০০।<br/>মাস্টার কন্ট্রোল প্যানেল ও গুগল শিট রিয়েলটাইম সিঙ্ক" +
        "</div>" +
      "</div>" +
    "</div>";

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (err) {
    Logger.log("Email error: " + err.toString());
  }
}

function handleIncompleteOrder(ss, payload) {
  var sheet = ss.getSheetByName("Incomplete_Orders");
  if (!sheet) {
    sheet = ss.insertSheet("Incomplete_Orders");
    sheet.appendRow(["Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address", "Products", "Total_Amount", "Status"]);
  }

  var dateStr = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
  var row = [
    dateStr,
    "INC-" + Math.floor(100000 + Math.random() * 900000),
    payload.account_type || "Customer",
    payload.customer_name || "",
    payload.phone || "",
    payload.address || "",
    payload.products || "",
    Number(payload.total_amount || 0),
    "Draft/Incomplete"
  ];

  sheet.appendRow(row);
  return { status: "success", success: true };
}

function logViewerActivity(ss, payload) {
  var sheet = ss.getSheetByName("Viewers");
  if (!sheet) {
    sheet = ss.insertSheet("Viewers");
    sheet.appendRow(["Time", "IP", "Address", "Name", "Phone", "Device", "Activity"]);
  }

  var dateStr = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([
    dateStr,
    payload.ip || "ClientIP",
    payload.address || "Bangladesh",
    payload.name || "Guest",
    payload.phone || "N/A",
    payload.device || "Mobile/Desktop",
    payload.activity || "Page View"
  ]);

  return { status: "success", success: true };
}

function handleSettingsUpdate(ss, payload) {
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    sheet = ss.insertSheet("Settings");
    sheet.appendRow(["Name", "Details", "Activation"]);
  }

  var name = payload.name;
  var details = payload.details;
  var activation = payload.activation !== undefined ? payload.activation : "TRUE";

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(name)) {
      sheet.getRange(i + 1, 2).setValue(details);
      sheet.getRange(i + 1, 3).setValue(activation);
      return { status: "success", success: true, message: "Setting updated" };
    }
  }

  sheet.appendRow([name, details, activation]);
  return { status: "success", success: true, message: "Setting created" };
}

function handleBannerAdd(ss, payload) {
  var sheet = ss.getSheetByName("Banners");
  if (!sheet) {
    sheet = ss.insertSheet("Banners");
    sheet.appendRow(["Banner_ID", "Title", "Image_URL", "Link", "Position", "Status"]);
  }
  sheet.appendRow([
    payload.banner_id || ("BAN-" + Math.floor(100 + Math.random() * 900)),
    payload.title || "",
    payload.image_url || "",
    payload.link || "/products",
    payload.position || "Home Main",
    payload.status || "Active"
  ]);
  return { status: "success", success: true };
}

function handleReviewAdd(ss, payload) {
  var sheet = ss.getSheetByName("Reviews");
  if (!sheet) {
    sheet = ss.insertSheet("Reviews");
    sheet.appendRow(["Date", "Product_SKU", "Customer_Name", "Rating", "Comment", "Status"]);
  }
  var dateStr = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([
    dateStr,
    payload.product_sku || "",
    payload.customer_name || "Customer",
    payload.rating || 5,
    payload.comment || "",
    "Approved"
  ]);
  return { status: "success", success: true };
}

function getSheetDataAsJson(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return { status: "success", success: true, data: { items: [], total: 0 } };
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { status: "success", success: true, data: { items: [], total: 0 } };
  }

  var headers = data[0];
  var items = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var hasContent = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== "" && row[c] !== null && row[c] !== undefined) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) continue;

    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var rawH = String(headers[h]).trim();
      var key = rawH.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      obj[key] = row[h];
      obj[rawH] = row[h];
    }
    items.push(obj);
  }

  return { 
    status: "success", 
    success: true, 
    data: { items: items, total: items.length } 
  };
}

function setupAllSystemSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var definitions = [
    { name: "Products", headers: ["SKU", "P_Name", "Category", "Sub_Category", "Child_Category", "Brand", "Buying_price", "Selling_Price", "Stock", "Original_Price", "WholeSale_price", "Min_order_Q", "Images", "Slug", "Description", "Specification", "Others", "Color", "Size", "WEIGHT_KG", "WIDTH_CM", "LENGTH_CM", "HEIGHT_CM"] },
    { name: "Categories", headers: ["Catagory_ID", "Catagory_Slug", "Category_Image", "Category", "Sub_Category", "Chail_Category"] },
    { name: "Brands", headers: ["Brand_ID", "Brand_Image", "Brand_Name", "Brand_Slug", "Brand_Description"] },
    { name: "Orders", headers: ["Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address", "Products", "Color", "Size", "Quantity", "Total_Amount", "Payment_method", "Transaction_ID", "Payment_Status", "Order_Status", "Reseller_Commission", "Commission_Status"] },
    { name: "Incomplete_Orders", headers: ["Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address", "Products", "Total_Amount", "Status"] },
    { name: "Viewers", headers: ["Time", "IP", "Address", "Name", "Phone", "Device", "Activity"] },
    { name: "Customers", headers: ["USER_ID", "Profile_photo", "Name", "Mobile", "Mail", "Address", "User_ID", "Password", "Status", "Success_order", "Cancel_Order", "Total_Order", "Order_Success_Rate"] },
    { name: "Resellers", headers: ["Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "NID_Number", "Date_of_birth", "Trade_Licence_No", "User_ID", "Password", "Status"] },
    { name: "Wholesalers", headers: ["Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "User_ID", "Password", "Status"] },
    { name: "Buying", headers: ["Date", "Who Buy", "Product Name", "buying price", "Quantity", "Total buying (calculated)", "Supplier", "Location"] },
    { name: "Costs", headers: ["Date", "Who Paid", "Purpose", "Amount", "Note"] },
    { name: "Invest", headers: ["Date", "Invest type", "Name of investor", "Amount", "Note"] },
    { name: "Others_Market", headers: ["Shop_ID", "Market_Logo", "Market_Name", "Shop_Name", "Shop_Link", "Status"] },
    { name: "Admin/Worker", headers: ["USER_ID", "Profile_Photo", "Name", "Mobile", "Mail", "Address", "Worker_Type", "Role", "User_Name", "Password"] },
    { name: "Settings", headers: ["Name", "Details", "Activation"] },
    { name: "Banners", headers: ["Banner_ID", "Title", "Image_URL", "Link", "Position", "Status"] },
    { name: "Reviews", headers: ["Date", "Product_SKU", "Customer_Name", "Rating", "Comment", "Status"] },
    { name: "Payments", headers: ["Date", "OrderID", "Method", "Account_Number", "TrxID", "Amount", "Status"] },
    { name: "Landing-Pages", headers: ["Page_ID", "Title", "Slug", "Content", "Banner", "Status"] },
    { name: "Worker-Logs", headers: ["Date", "Worker_Name", "Action", "Details", "Status"] }
  ];

  definitions.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
      sheet.appendRow(item.headers);
      sheet.setFrozenRows(1);
    }
  });

  return { status: "success", success: true, message: "All 20 sheets successfully initialized!" };
}

function handleCustomerRegistration(ss, payload) {
  var sheet = ss.getSheetByName("Customers");
  if (!sheet) {
    sheet = ss.insertSheet("Customers");
    sheet.appendRow([
      "USER_ID", "Profile_photo", "Name", "Mobile", "Mail", "Address", "User_ID", "Password", "Status", "Success_order", "Cancel_Order", "Total_Order", "Order_Success_Rate"
    ]);
    sheet.setFrozenRows(1);
  }

  var rawPhone = String(payload.mobile || payload.phone || "").trim();
  var cleanPhone = rawPhone.replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
  if (cleanPhone.length === 10 && cleanPhone.charAt(0) === '1') cleanPhone = '0' + cleanPhone;

  var rawMail = String(payload.mail || payload.email || "").trim().toLowerCase();
  var rawPass = String(payload.password || "").trim();
  var rawName = String(payload.name || "সম্মানিত গ্রাহক").trim();
  var rawAddr = String(payload.address || "").trim();
  var rawPhoto = String(payload.profile_photo || payload.Profile_photo || "").trim();

  // Check if phone or email already registered in Customers sheet
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowMobile = String(data[i][3] || "").trim().replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
    if (rowMobile.length === 10 && rowMobile.charAt(0) === '1') rowMobile = '0' + rowMobile;
    var rowMail = String(data[i][4] || "").trim().toLowerCase();

    if ((cleanPhone && rowMobile === cleanPhone) || (rawMail && rowMail === rawMail)) {
      return {
        status: "error",
        success: false,
        message: "এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে। অনুগ্রহ করে লগইন করুন।"
      };
    }
  }

  var userId = payload.user_id || payload.USER_ID || ("CUST-" + Math.floor(100000 + Math.random() * 900000));

  // Exact 13 Columns:
  // A=USER_ID, B=Profile_photo, C=Name, D=Mobile, E=Mail, F=Address, G=User_ID, H=Password, I=Status, J=Success_order, K=Cancel_Order, L=Total_Order, M=Order_Success_Rate
  var row = [
    userId,               // A = USER_ID
    rawPhoto,             // B = Profile_photo
    rawName,              // C = Name
    cleanPhone,           // D = Mobile
    rawMail,              // E = Mail
    rawAddr,              // F = Address
    userId,               // G = User_ID
    rawPass,              // H = Password
    "Active",             // I = Status
    0,                    // J = Success_order
    0,                    // K = Cancel_Order
    0,                    // L = Total_Order
    "100%"                // M = Order_Success_Rate
  ];

  sheet.appendRow(row);

  return {
    status: "success",
    success: true,
    message: "কাস্টমার অ্যাকাউন্ট সফলভাবে শিটে জমা হয়েছে!",
    data: {
      user_id: userId,
      USER_ID: userId,
      profile_photo: rawPhoto,
      name: rawName,
      mobile: cleanPhone,
      phone: cleanPhone,
      mail: rawMail,
      email: rawMail,
      address: rawAddr,
      account_type: "CUSTOMER",
      role: "Customer",
      status: "Active",
      success_order: 0,
      cancel_order: 0,
      total_order: 0,
      order_success_rate: "100%"
    }
  };
}

function handleCustomerLogin(ss, payload) {
  var sheet = ss.getSheetByName("Customers");
  if (!sheet) {
    return { status: "error", success: false, message: "Customers শিট পাওয়া যায়নি।" };
  }

  var identifier = String(payload.phone || payload.mobile || payload.identifier || payload.mail || payload.email || payload.username || "").trim();
  var inputPass = String(payload.password || "").trim();

  var cleanPhone = identifier.replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
  if (cleanPhone.length === 10 && cleanPhone.charAt(0) === '1') cleanPhone = '0' + cleanPhone;
  var cleanMail = identifier.toLowerCase();

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rUserIdA = String(data[i][0] || "").trim().toLowerCase();
    var rPhoto = String(data[i][1] || "").trim();
    var rName = String(data[i][2] || "").trim();
    var rMobile = String(data[i][3] || "").trim().replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
    if (rMobile.length === 10 && rMobile.charAt(0) === '1') rMobile = '0' + rMobile;
    var rMail = String(data[i][4] || "").trim().toLowerCase();
    var rAddr = String(data[i][5] || "").trim();
    var rUserIdG = String(data[i][6] || "").trim().toLowerCase();
    var rPass = String(data[i][7] || "").trim();
    var rStatus = String(data[i][8] || "Active").trim();
    var rSuccessOrder = Number(data[i][9] || 0);
    var rCancelOrder = Number(data[i][10] || 0);
    var rTotalOrder = Number(data[i][11] || 0);
    var rRate = String(data[i][12] || "100%").trim();

    var isMatch = (cleanPhone && rMobile === cleanPhone) ||
                  (cleanMail && rMail === cleanMail) ||
                  (rUserIdA && rUserIdA === identifier.toLowerCase()) ||
                  (rUserIdG && rUserIdG === identifier.toLowerCase());

    if (isMatch) {
      if (rStatus.toLowerCase() === "blocked" || rStatus.toLowerCase() === "inactive" || rStatus.toLowerCase() === "suspended") {
        return {
          status: "error",
          success: false,
          message: "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত বা ব্লক করা আছে। কাস্টমার সাপোর্টে যোগাযোগ করুন।"
        };
      }

      if (rPass !== inputPass) {
        return {
          status: "error",
          success: false,
          message: "ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।"
        };
      }

      var customerProfile = {
        user_id: data[i][0] || data[i][6] || ("CUST-" + i),
        USER_ID: data[i][0] || data[i][6] || ("CUST-" + i),
        profile_photo: rPhoto,
        name: rName,
        mobile: data[i][3],
        phone: data[i][3],
        mail: data[i][4],
        email: data[i][4],
        address: rAddr,
        status: rStatus,
        success_order: rSuccessOrder,
        cancel_order: rCancelOrder,
        total_order: rTotalOrder,
        order_success_rate: rRate,
        account_type: "CUSTOMER",
        role: "Customer"
      };

      return {
        status: "success",
        success: true,
        message: "লগইন সফল হয়েছে!",
        data: customerProfile
      };
    }
  }

  return {
    status: "error",
    success: false,
    message: "মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। Customers তালিকায় আপনার তথ্য পাওয়া যায়নি।"
  };
}
