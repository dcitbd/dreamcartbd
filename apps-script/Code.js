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
      if (parsed.payload) {
        payload = typeof parsed.payload === "string" ? JSON.parse(parsed.payload) : parsed.payload;
      } else if (parsed.data) {
        payload = typeof parsed.data === "string" ? JSON.parse(parsed.data) : parsed.data;
      } else {
        payload = parsed;
      }
    } catch (err) {
      // Handle application/x-www-form-urlencoded body if e.parameter didn't catch it
      try {
        var rawBody = String(e.postData.contents || "");
        var parts = rawBody.split("&");
        for (var i = 0; i < parts.length; i++) {
          var kv = parts[i].split("=");
          var k = decodeURIComponent((kv[0] || "").replace(/\+/g, " "));
          var v = decodeURIComponent((kv.slice(1).join("=") || "").replace(/\+/g, " "));
          if (k === "action" && !action) action = v;
          if (k === "payload" || k === "data") {
            try { payload = JSON.parse(v); } catch (e2) {}
          }
        }
      } catch (e3) {}
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

function ensureSheetWithHeaders(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function nowDhaka() {
  return Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
}

function dispatchAction(action, payload) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  switch (action) {
    case "system/health":
      return { status: "success", success: true, message: "Dream Cart BD Gateway Active!", time: new Date().toISOString() };

    case "setup":
    case "system/setup":
      return setupAllSystemSheets();

    // --- PRODUCTS ---
    case "products/list":
      return getSheetDataAsJson(ss, "Products");
    case "products/add":
    case "products/create":
    case "products/update":
      return handleProductUpsert(ss, payload);
    case "products/delete":
      return handleProductDelete(ss, payload);

    // --- CATEGORIES ---
    case "categories/list":
      return getSheetDataAsJson(ss, "Categories");
    case "categories/add":
    case "categories/create":
    case "categories/update":
      return handleCategoryUpsert(ss, payload);
    case "categories/delete":
      return handleCategoryDelete(ss, payload);

    // --- BRANDS ---
    case "brands/list":
      return getSheetDataAsJson(ss, "Brands");
    case "brands/add":
    case "brands/create":
    case "brands/update":
      return handleBrandUpsert(ss, payload);
    case "brands/delete":
      return handleBrandDelete(ss, payload);

    // --- LANDING PAGES ---
    case "landing_pages/list":
      return getSheetDataAsJson(ss, "Landing-Pages");
    case "landing_pages/add":
    case "landing_pages/create":
    case "landing_pages/update":
      return handleLandingPageUpsert(ss, payload);
    case "landing_pages/delete":
      return handleGenericDelete(ss, "Landing-Pages", [0, 2], payload.id || payload.page_id || payload.slug);

    // --- ORDERS ---
    case "orders/list":
      return getSheetDataAsJson(ss, "Orders");
    case "orders/create":
    case "orders/add":
      return handleOrderCreation(ss, payload);
    case "orders/update":
    case "orders/update_status":
      return handleOrderStatusUpdate(ss, payload);
    case "orders/delete":
      return handleGenericDelete(ss, "Orders", [1], payload.order_id || payload.orderId || payload.id);

    // --- INCOMPLETE ORDERS ---
    case "incomplete_orders/list":
      return getSheetDataAsJson(ss, "Incomplete_Orders");
    case "incomplete_orders/create":
    case "incomplete_orders/add":
      return handleIncompleteOrder(ss, payload);
    case "incomplete_orders/delete":
      return handleGenericDelete(ss, "Incomplete_Orders", [1, 4], payload.order_id || payload.id || payload.phone);

    // --- CUSTOMERS ---
    case "customers/list":
      return getSheetDataAsJson(ss, "Customers");
    case "customers/login":
      return handleCustomerLogin(ss, payload);
    case "customers/register":
    case "customers/create":
    case "customers/add":
    case "customers/update":
      return handleCustomerRegistration(ss, payload);
    case "customers/delete":
      return handleGenericDelete(ss, "Customers", [0, 3, 6], payload.user_id || payload.id || payload.phone || payload.mobile);

    // --- REVIEWS ---
    case "reviews/list":
      return getSheetDataAsJson(ss, "Reviews");
    case "reviews/add":
    case "reviews/create":
      return handleReviewAdd(ss, payload);
    case "reviews/delete":
      return handleGenericDelete(ss, "Reviews", [1, 2], payload.id || payload.product_sku || payload.customer_name);

    // --- PARTNERS: RESELLERS, WHOLESALERS, SELLERS, OTHERS_MARKET ---
    case "resellers/list":
      return getSheetDataAsJson(ss, "Resellers");
    case "resellers/register":
    case "resellers/add":
    case "resellers/create":
    case "resellers/update":
      return handleResellerUpsert(ss, payload);
    case "resellers/delete":
      return handleGenericDelete(ss, "Resellers", [0, 3, 10], payload.shop_id || payload.id || payload.mobile || payload.phone);

    case "wholesalers/list":
      return getSheetDataAsJson(ss, "Wholesalers");
    case "wholesalers/register":
    case "wholesalers/add":
    case "wholesalers/create":
    case "wholesalers/update":
      return handleWholesalerUpsert(ss, payload);
    case "wholesalers/delete":
      return handleGenericDelete(ss, "Wholesalers", [0, 3, 7], payload.shop_id || payload.id || payload.mobile || payload.phone);

    case "sellers/list":
      return getSheetDataAsJson(ss, "Settings");
    case "sellers/add":
    case "sellers/create":
    case "sellers/update":
      return handleSellerUpsert(ss, payload);
    case "sellers/delete":
      return handleSettingsDelete(ss, "SELLER_" + (payload.id || payload.seller_id || payload.store));

    case "markets/list":
      return getSheetDataAsJson(ss, "Others_Market");
    case "markets/add":
    case "markets/create":
    case "markets/update":
      return handleOthersMarketUpsert(ss, payload);
    case "markets/delete":
      return handleGenericDelete(ss, "Others_Market", [0, 2, 3], payload.shop_id || payload.id || payload.market_name);

    // --- TEAM & ADMIN: ADMIN/WORKER ---
    case "admin_worker/list":
    case "admins/list":
    case "workers/list":
      return getSheetDataAsJson(ss, "Admin/Worker");
    case "admin_worker/add":
    case "admin_worker/create":
    case "admin_worker/update":
    case "admins/add":
    case "workers/add":
      return handleAdminWorkerUpsert(ss, payload);
    case "admin_worker/delete":
    case "admins/delete":
    case "workers/delete":
      return handleGenericDelete(ss, "Admin/Worker", [0, 3, 8], payload.user_id || payload.USER_ID || payload.id || payload.user_name);

    // --- FINANCE & INVENTORY: BUYING, COSTS, INVEST, PAYMENTS ---
    case "buying/list":
      return getSheetDataAsJson(ss, "Buying");
    case "buying/add":
    case "buying/create":
      return handleBuyingAdd(ss, payload);
    case "buying/delete":
      return handleGenericDelete(ss, "Buying", [0, 2], payload.id || payload.product || payload.date);

    case "costs/list":
      return getSheetDataAsJson(ss, "Costs");
    case "costs/add":
    case "costs/create":
      return handleCostAdd(ss, payload);
    case "costs/delete":
      return handleGenericDelete(ss, "Costs", [0, 2], payload.id || payload.purpose || payload.title);

    case "invest/list":
      return getSheetDataAsJson(ss, "Invest");
    case "invest/add":
    case "invest/create":
      return handleInvestAdd(ss, payload);
    case "invest/delete":
      return handleGenericDelete(ss, "Invest", [0, 2], payload.id || payload.investor);

    case "payments/list":
      return getSheetDataAsJson(ss, "Payments");
    case "payments/add":
    case "payments/create":
      return handlePaymentAdd(ss, payload);

    // --- COURIERS, FRAUD & SYSTEM SETTINGS ---
    case "couriers/add":
    case "couriers/update":
      return handleSettingsUpdate(ss, {
        name: "COURIER_" + (payload.id || payload.name || "CFG"),
        details: JSON.stringify(payload),
        activation: payload.status === "Inactive" ? "FALSE" : "TRUE"
      });
    case "couriers/send_order":
      return handleCourierSendOrder(ss, payload);

    case "fraud/add_complaint":
      return handleSettingsUpdate(ss, {
        name: "FRAUD_COMPLAINT_" + (payload.id || Date.now()),
        details: JSON.stringify(payload),
        activation: "TRUE"
      });

    case "viewers/list":
      return getSheetDataAsJson(ss, "Viewers");
    case "viewers/log":
      return logViewerActivity(ss, payload);

    case "settings/list":
      return getSheetDataAsJson(ss, "Settings");
    case "settings/update":
    case "settings/add":
      return handleSettingsUpdate(ss, payload);
    case "settings/delete":
      return handleSettingsDelete(ss, payload.name || payload.id);

    case "banners/list":
      return getSheetDataAsJson(ss, "Banners");
    case "banners/add":
    case "banners/update":
      return handleBannerAdd(ss, payload);
    case "banners/delete":
      return handleGenericDelete(ss, "Banners", [0, 1], payload.banner_id || payload.id || payload.title);

    default:
      return { status: "success", success: true, message: "Action executed: " + action };
  }
}

function handleProductUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Products", [
    "SKU", "P_Name", "Category", "Sub_Category", "Child_Category", "Brand",
    "Buying_price", "Selling_Price", "Stock", "Original_Price", "WholeSale_price",
    "Min_order_Q", "Images", "Slug", "Description", "Specification", "Others",
    "Color", "Size", "WEIGHT_KG", "WIDTH_CM", "LENGTH_CM", "HEIGHT_CM"
  ]);

  var sku = String(payload.sku || payload.product_id || ("DCBD-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var name = String(payload.name || payload.p_name || "নতুন পণ্য").trim();
  var slug = String(payload.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
  var imagesStr = Array.isArray(payload.images) ? payload.images.join(" | ") : String(payload.images || payload.thumbnail || "");

  var row = [
    sku,
    name,
    payload.category || "General",
    payload.sub_category || "",
    payload.child_category || "",
    payload.brand || "Dream Cart BD",
    Number(payload.buying_price || 0),
    Number(payload.selling_price || 0),
    Number(payload.stock !== undefined ? payload.stock : 10),
    Number(payload.original_price || payload.selling_price || 0),
    Number(payload.wholesale_price || Math.round((Number(payload.selling_price) || 0) * 0.85)),
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

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === sku.toLowerCase()) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, message: "Product updated in Sheet!", data: { sku: sku, slug: slug } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, message: "Product added to Sheet!", data: { sku: sku, slug: slug } };
}

function handleProductDelete(ss, payload) {
  return handleGenericDelete(ss, "Products", [0, 13], payload.id || payload.sku || payload.slug);
}

function handleCategoryUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Categories", [
    "Catagory_ID", "Catagory_Slug", "Category_Image", "Category", "Sub_Category", "Chail_Category"
  ]);

  var catId = String(payload.catagory_id || payload.id || ("CAT-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var catName = String(payload.category || payload.name || "Category").trim();
  var slug = String(payload.catagory_slug || payload.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();

  var row = [
    catId,
    slug,
    payload.category_image || payload.image || "",
    catName,
    payload.sub_category || "",
    payload.chail_category || payload.child_category || ""
  ];

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (
      String(data[i][0]).trim().toLowerCase() === catId.toLowerCase() ||
      String(data[i][3]).trim().toLowerCase() === catName.toLowerCase() ||
      (payload.old_category && String(data[i][3]).trim().toLowerCase() === String(payload.old_category).trim().toLowerCase())
    ) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, message: "Category updated in Sheet!", data: { catagory_id: catId, catagory_slug: slug } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, message: "Category added to Sheet!", data: { catagory_id: catId, catagory_slug: slug } };
}

function handleCategoryDelete(ss, payload) {
  return handleGenericDelete(ss, "Categories", [0, 3], payload.id || payload.catagory_id || payload.category);
}

function handleBrandUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Brands", [
    "Brand_ID", "Brand_Image", "Brand_Name", "Brand_Slug", "Brand_Description"
  ]);

  var brandId = String(payload.brand_id || payload.id || ("BRD-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var brandName = String(payload.brand_name || payload.name || "Brand").trim();
  var slug = String(payload.brand_slug || payload.slug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();

  var row = [
    brandId,
    payload.brand_image || payload.image || "",
    brandName,
    slug,
    payload.brand_description || payload.description || ""
  ];

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (
      String(data[i][0]).trim().toLowerCase() === brandId.toLowerCase() ||
      String(data[i][2]).trim().toLowerCase() === brandName.toLowerCase()
    ) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, message: "Brand updated in Sheet!", data: { brand_id: brandId, brand_slug: slug } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, message: "Brand added to Sheet!", data: { brand_id: brandId, brand_slug: slug } };
}

function handleBrandDelete(ss, payload) {
  return handleGenericDelete(ss, "Brands", [0, 2], payload.id || payload.brand_id || payload.brand_name);
}

function handleLandingPageUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Landing-Pages", [
    "Page_ID", "Title", "Slug", "Content", "Banner", "Status"
  ]);

  var pageId = String(payload.id || payload.page_id || ("LP-" + Math.floor(100 + Math.random() * 900))).trim();
  var title = String(payload.title || "ক্যাম্পেইন ল্যান্ডিং পেজ").trim();
  var slug = String(payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
  var contentObj = {
    subtitle: payload.subtitle || "",
    badge: payload.badge || "",
    promo: payload.promo || "",
    theme: payload.theme || "emerald",
    hotline: payload.hotline || "01581703822",
    cta_text: payload.cta_text || "এখনই অর্ডার করুন →",
    banners: payload.banners || [],
    videos: payload.videos || [],
    features: payload.features || [],
    selected_products: payload.selected_products || []
  };
  var contentJson = JSON.stringify(contentObj);
  var banner = String(payload.hero_banner || payload.banner || "");
  var status = String(payload.status || "Active");

  var row = [pageId, title, slug, contentJson, banner, status];
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === pageId.toLowerCase() || String(data[i][2]).trim().toLowerCase() === slug.toLowerCase()) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, message: "Landing Page updated in Sheet!", data: { id: pageId, slug: slug } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, message: "Landing Page added to Sheet!", data: { id: pageId, slug: slug } };
}

function handleOrderCreation(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Orders", [
    "Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address",
    "Products", "Color", "Size", "Quantity", "Total_Amount", "Payment_method",
    "Transaction_ID", "Payment_Status", "Order_Status", "Reseller_Commission", "Commission_Status"
  ]);

  var orderId = String(payload.order_id || payload.orderId || ("ORD-" + Math.floor(100000 + Math.random() * 900000))).trim();
  var dateStr = payload.date || nowDhaka();

  var productsDesc = payload.products || payload.product_name || "";
  var colorsStr = payload.color || "";
  var sizesStr = payload.size || "";
  var totalQty = Number(payload.quantity || 0);

  if (Array.isArray(payload.items) && payload.items.length > 0) {
    if (!productsDesc) {
      productsDesc = payload.items.map(function(item) {
        var v = [item.size ? "Size:" + item.size : "", item.color ? "Color:" + item.color : ""].filter(Boolean).join(", ");
        return (item.name || item.p_name || "পণ্য") + (v ? " [" + v + "]" : "") + " x" + (item.quantity || 1);
      }).join(" | ");
    }
    if (!colorsStr) {
      colorsStr = payload.items.map(function(item) { return item.color || "Standard"; }).join(", ");
    }
    if (!sizesStr) {
      sizesStr = payload.items.map(function(item) { return item.size || "Free Size"; }).join(", ");
    }
    if (!totalQty) {
      totalQty = payload.items.reduce(function(acc, item) { return acc + (Number(item.quantity) || 1); }, 0);
    }
  }
  if (!productsDesc) productsDesc = "পণ্য অর্ডার";
  if (!totalQty) totalQty = 1;

  var row = [
    dateStr,
    orderId,
    payload.account_type || "Customer",
    payload.customer_name || "গ্রাহক",
    payload.phone || "",
    payload.address || "",
    productsDesc,
    colorsStr || "Standard",
    sizesStr || "Free Size",
    totalQty,
    Number(payload.total_amount || 0),
    payload.payment_method || "Cash On Delivery (COD)",
    payload.transaction_id || "N/A",
    payload.payment_status || "Pending",
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
  var orderId = String(payload.order_id || payload.orderId || payload.id || "").trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === orderId) {
      if (payload.customer_name !== undefined) sheet.getRange(i + 1, 4).setValue(payload.customer_name);
      if (payload.phone !== undefined) sheet.getRange(i + 1, 5).setValue(payload.phone);
      if (payload.address !== undefined) sheet.getRange(i + 1, 6).setValue(payload.address);
      if (payload.products !== undefined) sheet.getRange(i + 1, 7).setValue(payload.products);
      if (payload.color !== undefined) sheet.getRange(i + 1, 8).setValue(payload.color);
      if (payload.size !== undefined) sheet.getRange(i + 1, 9).setValue(payload.size);
      if (payload.quantity !== undefined) sheet.getRange(i + 1, 10).setValue(Number(payload.quantity));
      if (payload.total_amount !== undefined) sheet.getRange(i + 1, 11).setValue(Number(payload.total_amount));
      if (payload.payment_method !== undefined) sheet.getRange(i + 1, 12).setValue(payload.payment_method);
      if (payload.transaction_id !== undefined) sheet.getRange(i + 1, 13).setValue(payload.transaction_id);
      if (payload.payment_status !== undefined) sheet.getRange(i + 1, 14).setValue(payload.payment_status);
      if (payload.order_status || payload.status) sheet.getRange(i + 1, 15).setValue(payload.order_status || payload.status);
      return { status: "success", success: true, message: "Order updated in Sheet" };
    }
  }

  return { status: "error", message: "Order not found" };
}

function handleIncompleteOrder(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Incomplete_Orders", [
    "Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address", "Products", "Total_Amount", "Status"
  ]);

  var dateStr = payload.date || nowDhaka();
  var incId = String(payload.order_id || payload.orderId || ("INC-" + Math.floor(100000 + Math.random() * 900000))).trim();
  var phone = String(payload.phone || "").trim();

  var row = [
    dateStr,
    incId,
    payload.account_type || "Customer",
    payload.customer_name || "",
    phone,
    payload.address || "",
    payload.products || "",
    Number(payload.total_amount || 0),
    payload.status || "Draft/Incomplete"
  ];

  // Update existing draft for same phone if already in Incomplete_Orders
  if (phone) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][4]).trim() === phone && String(data[i][8]) === "Draft/Incomplete") {
        row[1] = data[i][1] || incId;
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        return { status: "success", success: true, data: { order_id: row[1] } };
      }
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, data: { order_id: incId } };
}

function handleResellerUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Resellers", [
    "Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "NID_Number", "Date_of_birth", "Trade_Licence_No", "User_ID", "Password", "Status"
  ]);

  var shopId = String(payload.Shop_ID || payload.shop_id || payload.id || ("RSL-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var mobile = String(payload.Mobile || payload.mobile || payload.phone || "").trim();
  var userId = String(payload.User_ID || payload.user_id || mobile || shopId).trim();

  var row = [
    shopId,
    payload.Shop_logo || payload.shop_logo || "",
    payload.Name || payload.name || "",
    mobile,
    payload.Mail || payload.mail || payload.email || "",
    payload.Address || payload.address || payload.city || "",
    payload.Shop_Name || payload.shop_name || payload.shop || "",
    payload.NID_Number || payload.nid_number || "",
    payload.Date_of_birth || payload.date_of_birth || "",
    payload.Trade_Licence_No || payload.trade_licence_no || "",
    userId,
    payload.Password || payload.password || "123456",
    payload.Status || payload.status || "Active"
  ];

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === shopId || (mobile && String(data[i][3]).trim() === mobile)) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, data: { shop_id: shopId } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, data: { shop_id: shopId } };
}

function handleWholesalerUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Wholesalers", [
    "Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "User_ID", "Password", "Status"
  ]);

  var shopId = String(payload.Shop_ID || payload.shop_id || payload.id || ("WHS-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var mobile = String(payload.Mobile || payload.mobile || payload.phone || "").trim();
  var userId = String(payload.User_ID || payload.user_id || mobile || shopId).trim();

  var row = [
    shopId,
    payload.Shop_logo || payload.shop_logo || "",
    payload.Name || payload.name || "",
    mobile,
    payload.Mail || payload.mail || payload.email || "",
    payload.Address || payload.address || "",
    payload.Shop_Name || payload.shop_name || payload.company || "",
    userId,
    payload.Password || payload.password || "123456",
    payload.Status || payload.status || "Approved"
  ];

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === shopId || (mobile && String(data[i][3]).trim() === mobile)) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, data: { shop_id: shopId } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, data: { shop_id: shopId } };
}

function handleSellerUpsert(ss, payload) {
  var sellerId = String(payload.id || payload.seller_id || ("VND-" + Math.floor(100 + Math.random() * 900))).trim();
  return handleSettingsUpdate(ss, {
    name: "SELLER_" + sellerId,
    details: JSON.stringify(payload),
    activation: payload.status === "Inactive" ? "FALSE" : "TRUE"
  });
}

function handleOthersMarketUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Others_Market", [
    "Shop_ID", "Market_Logo", "Market_Name", "Shop_Name", "Shop_Link", "Status"
  ]);

  var shopId = String(payload.Shop_ID || payload.shop_id || payload.id || ("MKT-" + Math.floor(100 + Math.random() * 900))).trim();
  var row = [
    shopId,
    payload.Market_Logo || payload.market_logo || "",
    payload.Market_Name || payload.market_name || payload.name || "",
    payload.Shop_Name || payload.shop_name || "",
    payload.Shop_Link || payload.shop_link || "",
    payload.Status || payload.status || "Active"
  ];

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === shopId) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, data: { shop_id: shopId } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, data: { shop_id: shopId } };
}

function handleAdminWorkerUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Admin/Worker", [
    "USER_ID", "Profile_Photo", "Name", "Mobile", "Mail", "Address", "Worker_Type", "Role", "User_Name", "Password"
  ]);

  var userId = String(payload.USER_ID || payload.user_id || payload.id || ("USR-" + Math.floor(100 + Math.random() * 900))).trim();
  var row = [
    userId,
    payload.Profile_Photo || payload.profile_photo || "",
    payload.Name || payload.name || "",
    payload.Mobile || payload.mobile || payload.phone || "",
    payload.Mail || payload.mail || payload.email || "",
    payload.Address || payload.address || "",
    payload.Worker_Type || payload.worker_type || "Admin",
    payload.Role || payload.role || "Full Access",
    payload.User_Name || payload.user_name || payload.Name || payload.name || "",
    payload.Password || payload.password || "admin123"
  ];

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === userId) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true, data: { user_id: userId } };
    }
  }

  sheet.appendRow(row);
  return { status: "success", success: true, data: { user_id: userId } };
}

function handleBuyingAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Buying", [
    "Date", "Who Buy", "Product Name", "buying price", "Quantity", "Total buying (calculated)", "Supplier", "Location"
  ]);
  var dateStr = payload.date || nowDhaka().slice(0, 10);
  var qty = Number(payload.quantity || 1);
  var unitPrice = Number(payload.buying_price || (payload.total_amount ? Math.round(Number(payload.total_amount) / Math.max(1, qty)) : 0));
  var total = Number(payload.total_amount || payload.total_buying || (unitPrice * qty));

  sheet.appendRow([
    dateStr,
    payload.who_buy || "Admin",
    payload.product_name || payload.product || "",
    unitPrice,
    qty,
    total,
    payload.supplier || "",
    payload.location || "Dhaka/Cumilla"
  ]);
  return { status: "success", success: true };
}

function handleCostAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Costs", [
    "Date", "Who Paid", "Purpose", "Amount", "Note"
  ]);
  var dateStr = payload.date || nowDhaka().slice(0, 10);
  sheet.appendRow([
    dateStr,
    payload.who_paid || "Admin",
    payload.purpose || payload.title || "",
    Number(payload.amount || 0),
    payload.note || payload.category || ""
  ]);
  return { status: "success", success: true };
}

function handleInvestAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Invest", [
    "Date", "Invest type", "Name of investor", "Amount", "Note"
  ]);
  var dateStr = payload.date || nowDhaka().slice(0, 10);
  sheet.appendRow([
    dateStr,
    payload.invest_type || "Working Capital",
    payload.investor || payload.name_of_investor || "",
    Number(payload.amount || 0),
    payload.note || ""
  ]);
  return { status: "success", success: true };
}

function handlePaymentAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Payments", [
    "Date", "OrderID", "Method", "Account_Number", "TrxID", "Amount", "Status"
  ]);
  var dateStr = payload.date || nowDhaka();
  sheet.appendRow([
    dateStr,
    payload.order_id || payload.id || "",
    payload.method || "bKash",
    payload.account_number || "",
    payload.trx_id || "N/A",
    Number(payload.amount || 0),
    payload.status || "Paid"
  ]);
  return { status: "success", success: true };
}

function handleCourierSendOrder(ss, payload) {
  handleOrderStatusUpdate(ss, {
    order_id: payload.order_id,
    order_status: "Shipped"
  });
  var logSheet = ensureSheetWithHeaders(ss, "Worker-Logs", [
    "Date", "Worker_Name", "Action", "Details", "Status"
  ]);
  logSheet.appendRow([
    nowDhaka(),
    payload.worker_name || "Admin",
    "Courier Booking (" + (payload.courier_name || "Steadfast") + ")",
    "Order: " + payload.order_id + " | Consignment: " + (payload.consignment_id || "") + " | API Key: " + (payload.api_key_masked || "Configured"),
    "Shipped"
  ]);
  return { status: "success", success: true, consignment_id: payload.consignment_id };
}

function handleGenericDelete(ss, sheetName, matchColIndices, targetVal) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || !targetVal) return { status: "error", message: "Sheet or target ID not found" };
  var data = sheet.getDataRange().getValues();
  var targetStr = String(targetVal).trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    for (var c = 0; c < matchColIndices.length; c++) {
      var colIdx = matchColIndices[c];
      if (String(data[i][colIdx] || "").trim().toLowerCase() === targetStr) {
        sheet.deleteRow(i + 1);
        return { status: "success", success: true, message: sheetName + " row deleted" };
      }
    }
  }
  return { status: "error", message: "Item not found in " + sheetName };
}

function handleSettingsDelete(ss, nameKey) {
  return handleGenericDelete(ss, "Settings", [0], nameKey);
}

function logViewerActivity(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Viewers", [
    "Time", "IP", "Address", "Name", "Phone", "Device", "Activity"
  ]);
  sheet.appendRow([
    nowDhaka(),
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
  var sheet = ensureSheetWithHeaders(ss, "Settings", ["Name", "Details", "Activation"]);
  var name = String(payload.name || payload.Name || "").trim();
  if (!name) return { status: "error", message: "Setting Name required" };
  var details = typeof payload.details === "object" ? JSON.stringify(payload.details) : String(payload.details !== undefined ? payload.details : (payload.Details || ""));
  var activation = payload.activation !== undefined ? String(payload.activation) : (payload.Activation !== undefined ? String(payload.Activation) : "TRUE");

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === name) {
      sheet.getRange(i + 1, 2).setValue(details);
      sheet.getRange(i + 1, 3).setValue(activation);
      return { status: "success", success: true, message: "Setting updated" };
    }
  }

  sheet.appendRow([name, details, activation]);
  return { status: "success", success: true, message: "Setting created" };
}

function handleBannerAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Banners", [
    "Banner_ID", "Title", "Image_URL", "Link", "Position", "Status"
  ]);
  var bId = String(payload.banner_id || ("BAN-" + Math.floor(100 + Math.random() * 900))).trim();
  var row = [
    bId,
    payload.title || "",
    payload.image_url || "",
    payload.link_url || payload.link || "/products",
    payload.position || 1,
    payload.status || "Active"
  ];
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === bId) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { status: "success", success: true };
    }
  }
  sheet.appendRow(row);
  return { status: "success", success: true };
}

function handleReviewAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Reviews", [
    "Date", "Product_SKU", "Customer_Name", "Rating", "Comment", "Status"
  ]);
  sheet.appendRow([
    payload.date || nowDhaka(),
    payload.product_sku || payload.product || "",
    payload.customer_name || payload.customer || "Customer",
    Number(payload.rating || 5),
    payload.comment || "",
    payload.status || "Approved"
  ]);
  return { status: "success", success: true };
}

function sendOrderReminderEmail(orderId, orderData, dateStr) {
  try {
    var recipient = NOTIFICATION_EMAIL;
    var subject = "🔔 [নতুন অর্ডার] " + orderId + " — " + (orderData.customer_name || "গ্রাহক") + " (৳" + (orderData.total_amount || 0) + ")";
    var htmlBody = "<div style=\"font-family: sans-serif; padding: 20px;\">" +
      "<h2>Dream Cart BD — নতুন অর্ডার: " + orderId + "</h2>" +
      "<p><b>তারিখ:</b> " + dateStr + "</p>" +
      "<p><b>গ্রাহক:</b> " + (orderData.customer_name || "N/A") + " (" + (orderData.phone || "N/A") + ")</p>" +
      "<p><b>ঠিকানা:</b> " + (orderData.address || "N/A") + "</p>" +
      "<p><b>পণ্য:</b> " + (orderData.products || "পণ্য") + "</p>" +
      "<p><b>মোট বিল:</b> ৳" + (orderData.total_amount || 0) + " (" + (orderData.payment_method || "COD") + ")</p>" +
      "</div>";
    MailApp.sendEmail({ to: recipient, subject: subject, htmlBody: htmlBody });
  } catch (err) {}
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
      obj["col_" + h] = row[h];
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
    ensureSheetWithHeaders(ss, item.name, item.headers);
  });

  return { status: "success", success: true, message: "All 20 sheets successfully initialized!" };
}

function handleCustomerRegistration(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Customers", [
    "USER_ID", "Profile_photo", "Name", "Mobile", "Mail", "Address", "User_ID", "Password", "Status", "Success_order", "Cancel_Order", "Total_Order", "Order_Success_Rate"
  ]);

  var rawPhone = String(payload.Mobile || payload.mobile || payload.phone || "").trim();
  var cleanPhone = rawPhone.replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
  if (cleanPhone.length === 10 && cleanPhone.charAt(0) === '1') cleanPhone = '0' + cleanPhone;

  var rawMail = String(payload.Mail || payload.mail || payload.email || "").trim().toLowerCase();
  var rawPass = String(payload.Password || payload.password || "123456").trim();
  var rawName = String(payload.Name || payload.name || "সম্মানিত গ্রাহক").trim();
  var rawAddr = String(payload.Address || payload.address || "").trim();
  var rawPhoto = String(payload.Profile_photo || payload.profile_photo || "").trim();
  var userId = String(payload.USER_ID || payload.user_id || ("CUST-" + Math.floor(100000 + Math.random() * 900000))).trim();

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowMobile = String(data[i][3] || "").trim().replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
    if (rowMobile.length === 10 && rowMobile.charAt(0) === '1') rowMobile = '0' + rowMobile;
    var rowId = String(data[i][0] || "").trim();

    if ((cleanPhone && rowMobile === cleanPhone) || (rowId && rowId === userId)) {
      if (payload.allow_update || payload.is_admin_manual) {
        var updatedRow = [
          rowId || userId,
          rawPhoto || data[i][1] || "",
          rawName || data[i][2] || "",
          cleanPhone || data[i][3] || "",
          rawMail || data[i][4] || "",
          rawAddr || data[i][5] || "",
          rowId || userId,
          rawPass || data[i][7] || "123456",
          payload.status || payload.Status || data[i][8] || "Active",
          Number(payload.success_order !== undefined ? payload.success_order : (data[i][9] || 0)),
          Number(payload.cancel_order !== undefined ? payload.cancel_order : (data[i][10] || 0)),
          Number(payload.total_order !== undefined ? payload.total_order : (data[i][11] || 0)),
          payload.order_success_rate || data[i][12] || "100%"
        ];
        sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
        return { status: "success", success: true, message: "কাস্টমার তথ্য আপডেট হয়েছে!", data: { user_id: rowId || userId } };
      }
      return {
        status: "error",
        success: false,
        message: "এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে। অনুগ্রহ করে লগইন করুন।"
      };
    }
  }

  var row = [
    userId,
    rawPhoto,
    rawName,
    cleanPhone,
    rawMail,
    rawAddr,
    userId,
    rawPass,
    payload.status || payload.Status || "Active",
    Number(payload.success_order || 0),
    Number(payload.cancel_order || 0),
    Number(payload.total_order || 0),
    payload.order_success_rate || "100%"
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
