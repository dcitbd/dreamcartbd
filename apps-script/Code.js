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
      if (parsed.payload) payload = parsed.payload;
      else if (parsed.data) payload = parsed.data;
      else payload = parsed;
    } catch (err) {}
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
  var sheet = ss.getSheetByName("Orders");
  if (!sheet) {
    sheet = ss.insertSheet("Orders");
    sheet.appendRow([
      "Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address",
      "Products", "Color", "Size", "Quantity", "Total_Amount", "Payment_method",
      "Transaction_ID", "Payment_Status", "Order_Status", "Reseller_Commission", "Commission_Status"
    ]);
  }

  var orderId = payload.order_id || ("ORD-" + Math.floor(100000 + Math.random() * 900000));
  var dateStr = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

  var productsDesc = payload.products;
  if (!productsDesc && payload.items && Array.isArray(payload.items)) {
    productsDesc = payload.items.map(function(item) {
      return (item.name || item.p_name) + " (" + (item.quantity || 1) + "x)";
    }).join(", ");
  }
  if (!productsDesc) productsDesc = "পণ্য অর্ডার";

  var row = [
    dateStr,
    orderId,
    payload.account_type || "Customer",
    payload.customer_name || "গ্রাহক",
    payload.phone || "",
    payload.address || "",
    productsDesc,
    payload.color || "",
    payload.size || "",
    Number(payload.quantity || (payload.items ? payload.items.length : 1)),
    Number(payload.total_amount || 0),
    payload.payment_method || "Cash On Delivery (COD)",
    payload.transaction_id || "N/A",
    payload.payment_status || "COD",
    payload.order_status || "Order Placed",
    Number(payload.reseller_commission || 0),
    payload.commission_status || "Pending"
  ];

  sheet.appendRow(row);
  sendOrderReminderEmail(orderId, payload, dateStr);

  return {
    status: "success",
    success: true,
    data: { order_id: orderId },
    message: "অর্ডার সফলভাবে শিটে জমা হয়েছে!"
  };
}

function handleOrderStatusUpdate(ss, payload) {
  var sheet = ss.getSheetByName("Orders");
  if (!sheet) return { status: "error", message: "Orders sheet not found" };

  var data = sheet.getDataRange().getValues();
  var orderId = String(payload.order_id || payload.orderId);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === orderId) {
      if (payload.order_status) sheet.getRange(i + 1, 15).setValue(payload.order_status);
      if (payload.payment_status) sheet.getRange(i + 1, 14).setValue(payload.payment_status);
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
