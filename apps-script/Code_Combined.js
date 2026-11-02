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
  action = String(action).trim().replace(/^[\-_\/]+|[\-_\/]+$/g, "");

  var isWriteAction = !(/\/list$|\/health$|\/details$|\/get$|\/login$/i.test(action));
  var lock = null;

  // Deduplicate identical request_id within 60 seconds using ScriptCache
  var reqId = payload && (payload._req_id || payload.request_id || "");
  if (isWriteAction && reqId) {
    try {
      var cache = CacheService.getScriptCache();
      var cachedResp = cache.get("DCBD_REQ_" + reqId);
      if (cachedResp) {
        var parsedCached = JSON.parse(cachedResp);
        if (callback) {
          return ContentService.createTextOutput(callback + "(" + JSON.stringify(parsedCached) + ")")
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
        return ContentService.createTextOutput(JSON.stringify(parsedCached))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } catch (cErr) {}
  }

  if (isWriteAction) {
    try {
      lock = LockService.getScriptLock();
      lock.waitLock(12000);
    } catch (lErr) {}
  }

  var responseObj;
  try {
    // Re-check cache after acquiring lock in case concurrent transport layers hit simultaneously
    if (isWriteAction && reqId) {
      try {
        var cache2 = CacheService.getScriptCache();
        var cachedResp2 = cache2.get("DCBD_REQ_" + reqId);
        if (cachedResp2) {
          responseObj = JSON.parse(cachedResp2);
        }
      } catch (cErr2) {}
    }

    if (!responseObj) {
      responseObj = dispatchAction(action, payload || {});
      if (isWriteAction && reqId && responseObj && responseObj.success !== false) {
        try {
          CacheService.getScriptCache().put("DCBD_REQ_" + reqId, JSON.stringify(responseObj), 120);
        } catch (cErr3) {}
      }
    }
  } catch (err) {
    responseObj = { status: "error", success: false, message: err.toString() };
  } finally {
    if (lock) {
      try { lock.releaseLock(); } catch (relErr) {}
    }
  }

  if (callback) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(responseObj) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Finds the last row that actually contains non-empty primary data in columns A..C,
 * ignoring pre-formatted blank rows or trailing unchecked checkboxes (false) at the bottom of the sheet.
 */
function writeOrUpsertRow(sheet, rowArray, matchFn, keyColsCount) {
  var lastRow = sheet.getLastRow();
  var numCols = rowArray.length;
  var scanCols = Math.max(keyColsCount || 3, Math.min(numCols, 6));

  if (lastRow <= 1) {
    sheet.getRange(2, 1, 1, numCols).setValues([rowArray]);
    SpreadsheetApp.flush();
    return { row: 2, updated: false };
  }

  var data = sheet.getRange(1, 1, lastRow, scanCols).getValues();
  var lastRealRow = 1;

  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var hasPrimaryText = false;
    for (var c = 0; c < Math.min(3, r.length); c++) {
      var v = r[c];
      if (v !== "" && v !== null && v !== undefined && v !== false) {
        if (String(v).trim() !== "") {
          hasPrimaryText = true;
          break;
        }
      }
    }
    if (hasPrimaryText) {
      lastRealRow = i + 1;
      if (typeof matchFn === "function" && matchFn(r, i)) {
        sheet.getRange(i + 1, 1, 1, numCols).setValues([rowArray]);
        SpreadsheetApp.flush();
        return { row: i + 1, updated: true };
      }
    }
  }

  var targetRow = lastRealRow + 1;
  sheet.getRange(targetRow, 1, 1, numCols).setValues([rowArray]);
  SpreadsheetApp.flush();
  return { row: targetRow, updated: false };
}

function findSheetCaseInsensitive(ss, targetName) {
  if (!ss) return null;
  var direct = ss.getSheetByName(targetName);
  if (direct) return direct;

  var sheets = ss.getSheets();
  var normTarget = String(targetName || "").trim().toLowerCase().replace(/[\s\-_\/]/g, "");
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName();
    var normName = sName.trim().toLowerCase().replace(/[\s\-_\/]/g, "");
    if (normName === normTarget) return sheets[i];
    if (normName + "s" === normTarget || normTarget + "s" === normName ||
        normName.replace(/ies$/, "y") === normTarget || normTarget.replace(/ies$/, "y") === normName) {
      return sheets[i];
    }
  }
  return null;
}

function getActiveSs(payload) {
  var ssId = (payload && (payload.spreadsheet_id || payload.spreadsheetId)) || SPREADSHEET_ID;
  if (ssId && ssId !== "YOUR_SPREADSHEET_ID_HERE") {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (err) {}
  }
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err2) {}
  return SpreadsheetApp.openById("1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8");
}

function ensureSheetWithHeaders(ss, sheetName, headers) {
  if (!ss) ss = getActiveSs();
  var sheet = findSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    try { sheet.setFrozenRows(1); } catch (e) {}
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    try { sheet.setFrozenRows(1); } catch (e2) {}
  }
  return sheet;
}

function nowDhaka() {
  return Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");
}

function normalizePhoneStr(p) {
  if (!p) return "";
  var s = String(p).trim().replace(/^(\+?88)/, "").replace(/[\s\-\(\)]/g, "");
  if (s.length === 10 && s.charAt(0) === "1") s = "0" + s;
  return s;
}

function dispatchAction(action, payload) {
  var ss = getActiveSs(payload);

  switch (action) {
    case "system/health":
      return { status: "success", success: true, message: "Dream Cart BD Gateway Active!", time: new Date().toISOString() };

    case "setup":
    case "system/setup":
      return setupAllSystemSheets(ss);

    // --- PRODUCTS ---
    case "products/list":
      return getSheetDataAsJson(ss, "Products", { compactProducts: !payload.full });
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

    // --- ATTRIBUTES & VARIANTS (COLOR & SIZE) ---
    case "attributes/list":
    case "variants/list":
      return getSheetDataAsJson(ss, "Attributes");
    case "attributes/add":
    case "attributes/create":
    case "attributes/update":
    case "variants/add":
    case "variants/create":
    case "variants/update":
      return handleAttributeUpsert(ss, payload);
    case "attributes/delete":
    case "variants/delete":
      return handleAttributeDelete(ss, payload);

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
    case "landing-pages/list":
      return getSheetDataAsJson(ss, "Landing-Pages");
    case "landing_pages/add":
    case "landing_pages/create":
    case "landing_pages/update":
    case "landing_pages/save":
    case "landing-pages/save":
    case "landing-pages/add":
      return handleLandingPageUpsert(ss, payload);
    case "landing_pages/delete":
    case "landing-pages/delete":
      return handleGenericDelete(ss, "Landing-Pages", [0, 1, 2], payload.slug || payload.id || payload.page_id);

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
      return handleGenericDelete(ss, "Reviews", [0, 1, 2], payload.review_id || payload.id || payload.product_sku || payload.customer_name);

    // --- PARTNERS: RESELLERS, WHOLESALERS, SELLERS, OTHERS_MARKET ---
    case "resellers/list":
      return getSheetDataAsJson(ss, "Resellers");
    case "resellers/register":
    case "resellers/add":
    case "resellers/create":
    case "resellers/update":
      return handleResellerUpsert(ss, payload);
    case "resellers/login":
      return handlePartnerLogin(ss, "Resellers", payload, "RESELLER");
    case "resellers/withdraw":
      return handlePaymentAdd(ss, payload);
    case "resellers/delete":
      return handleGenericDelete(ss, "Resellers", [0, 3, 10], payload.shop_id || payload.id || payload.mobile || payload.phone);

    case "wholesalers/list":
      return getSheetDataAsJson(ss, "Wholesalers");
    case "wholesalers/register":
    case "wholesalers/add":
    case "wholesalers/create":
    case "wholesalers/update":
      return handleWholesalerUpsert(ss, payload);
    case "wholesalers/login":
      return handlePartnerLogin(ss, "Wholesalers", payload, "WHOLESALER");
    case "wholesalers/delete":
      return handleGenericDelete(ss, "Wholesalers", [0, 3, 7], payload.shop_id || payload.id || payload.mobile || payload.phone);

    case "sellers/list":
      return getSheetDataAsJson(ss, "Sellers");
    case "sellers/add":
    case "sellers/create":
    case "sellers/update":
    case "sellers/register":
      return handleSellerDirectUpsert(ss, payload);
    case "sellers/delete":
      return handleGenericDelete(ss, "Sellers", [0, 3, 4], payload.shop_id || payload.id || payload.mobile || payload.seller_id);

    case "markets/list":
    case "others_market/list":
      return getSheetDataAsJson(ss, "Others_Market");
    case "markets/add":
    case "markets/create":
    case "markets/update":
    case "others_market/create":
    case "others_market/add":
    case "others_market/update":
      return handleOthersMarketUpsert(ss, payload);
    case "markets/delete":
    case "others_market/delete":
      return handleGenericDelete(ss, "Others_Market", [0, 2, 3], payload.shop_id || payload.id || payload.market_name);

    // --- TEAM & ADMIN: ADMINWORKER ---
    case "admin_worker/list":
    case "admins/list":
    case "workers/list":
      return getSheetDataAsJson(ss, "AdminWorker");
    case "admin_worker/add":
    case "admin_worker/create":
    case "admin_worker/update":
    case "admins/add":
    case "workers/add":
      return handleAdminWorkerUpsert(ss, payload);
    case "admin_worker/delete":
    case "admins/delete":
    case "workers/delete":
      return handleGenericDelete(ss, "AdminWorker", [0, 3, 8], payload.user_id || payload.USER_ID || payload.id || payload.user_name);

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
    case "payments/update":
      return handlePaymentAdd(ss, payload);
    case "payments/delete":
      return handleGenericDelete(ss, "Payments", [0, 1, 9], payload.request_id || payload.id || payload.order_id);

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
    case "settings/save":
    case "settings/update":
    case "settings/add":
      return handleSettingsUpdate(ss, payload);
    case "settings/delete":
      return handleSettingsDelete(ss, payload.name || payload.id);

    case "banners/list":
      return getSheetDataAsJson(ss, "Banners");
    case "banners/add":
    case "banners/create":
    case "banners/update":
      return handleBannerAdd(ss, payload);
    case "banners/delete":
      return handleGenericDelete(ss, "Banners", [0, 1], payload.banner_id || payload.id || payload.title);

    default:
      return { status: "success", success: true, message: "Action executed: " + action };
  }
}

function handleAttributeUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Attributes", ["Date", "Type", "Name_Value", "Status"]);
  var dateStr = payload.date || payload.Date || nowDhaka();
  var type = String(payload.Type || payload.type || (payload.color ? "Color" : (payload.size ? "Size" : "Variant"))).trim();
  var val = String(payload.Name_Value || payload.name_value || payload.val || payload.value || payload.name || payload.color || payload.size || "").trim();
  var oldVal = String(payload.old_value || "").trim().toLowerCase();
  var status = String(payload.Status || payload.status || "Active").trim();
  if (!val) return { status: "error", success: false, message: "Empty attribute value" };

  var row = [dateStr, type, val, status];
  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rType = String(r[1] || "").trim().toLowerCase();
    var rVal = String(r[2] || "").trim().toLowerCase();
    if (rType !== type.toLowerCase()) return false;
    return rVal === val.toLowerCase() || (oldVal && rVal === oldVal);
  }, 3);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Attribute updated in Sheet!" : "Attribute added to Sheet!",
    data: { date: dateStr, type: type, name_value: val, status: status }
  };
}

function handleAttributeDelete(ss, payload) {
  var type = String(payload.type || payload.Type || "").trim().toLowerCase();
  var val = String(payload.name_value || payload.Name_Value || payload.val || payload.value || payload.name || payload.color || payload.size || "").trim().toLowerCase();
  var sheet = findSheetCaseInsensitive(ss, "Attributes");
  if (!sheet || !val) return { status: "success", success: true };
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: "success", success: true };
  var data = sheet.getRange(1, 1, lastRow, 4).getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    var rowType = String(data[i][1] || "").trim().toLowerCase();
    var rowVal = String(data[i][2] || "").trim().toLowerCase();
    if ((!type || rowType === type) && rowVal === val) {
      sheet.deleteRow(i + 1);
    }
  }
  return { status: "success", success: true, message: "Attribute deleted from Sheet!" };
}

function handleSellerDirectUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Sellers", [
    "Shop_ID", "Shop_logo", "Shop_Name", "Name", "Mobile", "Mail", "Address", "Commission_Rate", "Status"
  ]);
  var shopId = String(payload.Shop_ID || payload.shop_id || payload.id || ("VND-" + Math.floor(100 + Math.random() * 900))).trim();
  var logo = String(payload.Shop_logo || payload.shop_logo || payload.logo || "").trim();
  var shopName = String(payload.Shop_Name || payload.shop_name || payload.store || "Merchant Store").trim();
  var ownerName = String(payload.Name || payload.name || payload.owner || "Merchant").trim();
  var mobile = String(payload.Mobile || payload.mobile || payload.phone || "").trim();
  var mail = String(payload.Mail || payload.mail || payload.email || "").trim();
  var addr = String(payload.Address || payload.address || "ঢাকা").trim();
  var comm = String(payload.Commission_Rate || payload.commission_rate || payload.commission || "10%").trim();
  var status = String(payload.Status || payload.status || "Active").trim();

  var row = [shopId, logo, shopName, ownerName, mobile, mail, addr, comm, status];
  var normMob = normalizePhoneStr(mobile);

  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rId = String(r[0] || "").trim().toLowerCase();
    var rMob = normalizePhoneStr(r[4]);
    return rId === shopId.toLowerCase() || (normMob && rMob === normMob);
  }, 5);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Seller updated in Sheet!" : "Seller added to Sheet!",
    data: { shop_id: shopId, shop_name: shopName, name: ownerName, mobile: mobile }
  };
}

function handleProductUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Products", [
    "SKU", "P_Name", "Category", "Sub_Category", "Child_Category", "Brand",
    "Buying_price", "Selling_Price", "Stock", "Original_Price", "WholeSale_price",
    "Min_order_Q", "Images", "Slug", "Description", "Specification", "Others",
    "Color", "Size", "WEIGHT_KG", "WIDTH_CM", "LENGTH_CM", "HEIGHT_CM"
  ]);

  var sku = String(payload.SKU || payload.sku || payload.product_id || ("DCBD-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var name = String(payload.P_Name || payload.p_name || payload.name || "নতুন পণ্য").trim();
  var slug = String(payload.Slug || payload.slug || name.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-").replace(/^-|-$/g, "") || sku.toLowerCase()).trim();
  var imagesStr = Array.isArray(payload.images)
    ? payload.images.join(", ")
    : String(payload.Images || payload.images || payload.thumbnail || "");

  var buyPrice = Number(payload.Buying_price !== undefined ? payload.Buying_price : (payload.buying_price || 0));
  var sellPrice = Number(payload.Selling_Price !== undefined ? payload.Selling_Price : (payload.selling_price || 0));
  var stock = Number(payload.Stock !== undefined ? payload.Stock : (payload.stock !== undefined ? payload.stock : 20));
  var origPrice = Number(payload.Original_Price !== undefined ? payload.Original_Price : (payload.original_price || (sellPrice > 0 ? Math.round(sellPrice * 1.35) : 0)));
  var wsPrice = Number(payload.WholeSale_price !== undefined ? payload.WholeSale_price : (payload.wholesale_price || (sellPrice > 0 ? Math.round(sellPrice * 0.85) : 0)));
  var minOrderQ = Number(payload.Min_order_Q !== undefined ? payload.Min_order_Q : (payload.min_order_q || payload.min_order_qty || (sellPrice <= 200 ? 10 : 5)));

  var row = [
    sku,
    name,
    String(payload.Category || payload.category || "General").trim(),
    String(payload.Sub_Category || payload.sub_category || "").trim(),
    String(payload.Child_Category || payload.child_category || "").trim(),
    String(payload.Brand || payload.brand || "Dream Cart BD").trim(),
    buyPrice,
    sellPrice,
    stock,
    origPrice,
    wsPrice,
    minOrderQ,
    imagesStr,
    slug,
    String(payload.Description || payload.description || ""),
    String(payload.Specification || payload.specification || ""),
    String(payload.Others || payload.others || ""),
    String(payload.Color || payload.color || "Standard"),
    String(payload.Size || payload.size || "Free Size"),
    Number(payload.WEIGHT_KG !== undefined ? payload.WEIGHT_KG : (payload.weight_kg || 0.25)),
    Number(payload.WIDTH_CM !== undefined ? payload.WIDTH_CM : (payload.width_cm || 10)),
    Number(payload.LENGTH_CM !== undefined ? payload.LENGTH_CM : (payload.length_cm || 10)),
    Number(payload.HEIGHT_CM !== undefined ? payload.HEIGHT_CM : (payload.height_cm || 5))
  ];

  // Fast SKU scan reading only Column A & B (avoids loading 8.9MB of descriptions!)
  var lastRow = sheet.getLastRow();
  var lastRealRow = 1;
  if (lastRow > 1) {
    var skuVals = sheet.getRange(1, 1, lastRow, 2).getValues();
    var targetSkuLower = sku.toLowerCase();
    for (var i = 1; i < skuVals.length; i++) {
      var rSku = String(skuVals[i][0] || "").trim();
      var rName = String(skuVals[i][1] || "").trim();
      if (rSku !== "" || rName !== "") {
        lastRealRow = i + 1;
        if (rSku.toLowerCase() === targetSkuLower) {
          sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
          SpreadsheetApp.flush();
          return { status: "success", success: true, message: "Product updated in Sheet!", data: { sku: sku, slug: slug, row: i + 1 } };
        }
      }
    }
  }

  var insertRow = lastRealRow + 1;
  sheet.getRange(insertRow, 1, 1, row.length).setValues([row]);
  SpreadsheetApp.flush();
  return { status: "success", success: true, message: "Product added to Sheet!", data: { sku: sku, slug: slug, row: insertRow } };
}

function handleProductDelete(ss, payload) {
  return handleGenericDelete(ss, "Products", [0, 13], payload.id || payload.sku || payload.SKU || payload.slug);
}

function handleCategoryUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Categories", [
    "Catagory_ID", "Catagory_Slug", "Category_Image", "Category", "Sub_Category", "Chail_Category"
  ]);

  var catId = String(payload.Catagory_ID || payload.catagory_id || payload.id || ("CAT-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var catName = String(payload.Category || payload.category || payload.name || "Category").trim();
  var slug = String(payload.Catagory_Slug || payload.catagory_slug || payload.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
  var img = String(payload.Category_Image || payload.category_image || payload.image || "").trim();
  var subCat = String(payload.Sub_Category || payload.sub_category || "General").trim();
  var childCat = String(payload.Chail_Category || payload.chail_category || payload.child_category || "Standard").trim();

  var row = [catId, slug, img, catName, subCat, childCat];
  var oldCatLower = payload.old_category ? String(payload.old_category).trim().toLowerCase() : "";

  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rId = String(r[0] || "").trim().toLowerCase();
    var rCat = String(r[3] || "").trim().toLowerCase();
    var rSub = String(r[4] || "").trim().toLowerCase();
    if (rId === catId.toLowerCase()) return true;
    if (oldCatLower && rCat === oldCatLower) return true;
    if (rCat === catName.toLowerCase() && (!subCat || rSub === subCat.toLowerCase())) return true;
    return false;
  }, 6);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Category updated in Sheet!" : "Category added to Sheet!",
    data: { catagory_id: catId, catagory_slug: slug, category: catName }
  };
}

function handleCategoryDelete(ss, payload) {
  return handleGenericDelete(ss, "Categories", [0, 3], payload.id || payload.catagory_id || payload.category);
}

function handleBrandUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Brands", [
    "Brand_ID", "Brand_Image", "Brand_Name", "Brand_Slug", "Brand_Description"
  ]);

  var brandId = String(payload.Brand_ID || payload.brand_id || payload.id || ("BRD-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var brandName = String(payload.Brand_Name || payload.brand_name || payload.name || "Brand").trim();
  var slug = String(payload.Brand_Slug || payload.brand_slug || payload.slug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
  var img = String(payload.Brand_Image || payload.brand_image || payload.image || "").trim();
  var desc = String(payload.Brand_Description || payload.brand_description || payload.description || "").trim();

  var row = [brandId, img, brandName, slug, desc];
  var res = writeOrUpsertRow(sheet, row, function(r) {
    return String(r[0] || "").trim().toLowerCase() === brandId.toLowerCase() ||
           String(r[2] || "").trim().toLowerCase() === brandName.toLowerCase();
  }, 5);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Brand updated in Sheet!" : "Brand added to Sheet!",
    data: { brand_id: brandId, brand_name: brandName, brand_slug: slug }
  };
}

function handleBrandDelete(ss, payload) {
  return handleGenericDelete(ss, "Brands", [0, 2], payload.id || payload.brand_id || payload.brand_name);
}

function handleLandingPageUpsert(ss, payload) {
  // Matches exact 11 columns in Dream Cart BD-Site.xlsx -> Landing-Pages:
  // ['Slug', 'Slogan', 'Main_Link', 'Products', 'Product_Images', 'Review_Images', 'Contact_Call', 'Contact_Whatsapp', 'Contact_Mail', 'Social_Icons', 'Status']
  var sheet = ensureSheetWithHeaders(ss, "Landing-Pages", [
    "Slug", "Slogan", "Main_Link", "Products", "Product_Images",
    "Review_Images", "Contact_Call", "Contact_Whatsapp", "Contact_Mail", "Social_Icons", "Status"
  ]);

  var pageId = String(payload.id || payload.page_id || ("LP-" + Math.floor(100 + Math.random() * 900))).trim();
  var title = String(payload.Slogan || payload.slogan || payload.title || "ক্যাম্পেইন ল্যান্ডিং পেজ").trim();
  var slug = String(payload.Slug || payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || pageId.toLowerCase()).trim();
  var mainLink = String(payload.Main_Link || payload.main_link || ("/landing?page=" + slug)).trim();

  var selectedProds = payload.Products || payload.selected_products || payload.selected_skus || [];
  var productsStr = Array.isArray(selectedProds) ? selectedProds.join(", ") : String(selectedProds || "");

  var bannerImgs = [];
  if (payload.hero_banner || payload.banner) bannerImgs.push(payload.hero_banner || payload.banner);
  if (Array.isArray(payload.banners)) {
    payload.banners.forEach(function(b) {
      var u = typeof b === "string" ? b : (b && b.url ? b.url : "");
      if (u && bannerImgs.indexOf(u) === -1) bannerImgs.push(u);
    });
  }
  var productImagesStr = payload.Product_Images || payload.product_images || bannerImgs.join(" | ");
  var reviewImagesStr = payload.Review_Images || payload.review_images || (Array.isArray(payload.videos) ? payload.videos.map(function(v) { return typeof v === "string" ? v : (v.url || ""); }).join(" | ") : "");
  var contactCall = String(payload.Contact_Call || payload.contact_call || payload.hotline || "01581703822").trim();
  var contactWa = String(payload.Contact_Whatsapp || payload.contact_whatsapp || payload.hotline || "01581703822").trim();
  var contactMail = String(payload.Contact_Mail || payload.contact_mail || NOTIFICATION_EMAIL).trim();

  var metaObj = {
    id: pageId,
    page_id: pageId,
    title: title,
    slug: slug,
    subtitle: payload.subtitle || "",
    badge: payload.badge || "",
    promo: payload.promo || "",
    theme: payload.theme || "emerald",
    hotline: contactCall,
    cta_text: payload.cta_text || "এখনই অর্ডার করুন →",
    hero_banner: payload.hero_banner || payload.banner || "",
    banners: payload.banners || [],
    videos: payload.videos || [],
    features: payload.features || payload.bullets || [],
    selected_products: Array.isArray(selectedProds) ? selectedProds : (productsStr ? productsStr.split(",").map(function(s) { return s.trim(); }) : [])
  };
  var socialIconsOrJson = payload.Social_Icons || JSON.stringify(metaObj);
  var status = String(payload.Status || payload.status || "Active").trim();

  var row = [
    slug,
    title,
    mainLink,
    productsStr,
    productImagesStr,
    reviewImagesStr,
    contactCall,
    contactWa,
    contactMail,
    socialIconsOrJson,
    status
  ];

  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rSlug = String(r[0] || "").trim().toLowerCase();
    var rTitle = String(r[1] || "").trim().toLowerCase();
    return rSlug === slug.toLowerCase() || rSlug === pageId.toLowerCase() || (title && rTitle === title.toLowerCase());
  }, 3);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Landing Page updated in Sheet!" : "Landing Page added to Sheet!",
    data: { id: pageId, slug: slug, title: title }
  };
}

function handleOrderCreation(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Orders", [
    "Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address",
    "Products", "Color", "Size", "Quantity", "Total_Amount", "Payment_method",
    "Transaction_ID", "Payment_Status", "Order_Status", "Reseller_Commission", "Commission_Status"
  ]);

  var orderId = String(payload.OrderID || payload.order_id || payload.orderId || ("ORD-" + Math.floor(100000 + Math.random() * 900000))).trim();
  var dateStr = payload.Date || payload.date || nowDhaka();

  var productsDesc = payload.Products || payload.products || payload.product_name || "";
  var colorsStr = payload.Color || payload.color || "";
  var sizesStr = payload.Size || payload.size || "";
  var totalQty = Number(payload.Quantity || payload.quantity || 0);

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

  var phoneStr = String(payload.Phone || payload.phone || "").trim();
  var normPhone = normalizePhoneStr(phoneStr);
  var totalAmt = Number(payload.Total_Amount !== undefined ? payload.Total_Amount : (payload.total_amount || 0));

  var row = [
    dateStr,
    orderId,
    payload.Account_type || payload.account_type || "Customer",
    payload.Customer_Name || payload.customer_name || "গ্রাহক",
    phoneStr,
    payload.Address || payload.address || "",
    productsDesc,
    colorsStr || "Standard",
    sizesStr || "Free Size",
    totalQty,
    totalAmt,
    payload.Payment_method || payload.payment_method || "Cash On Delivery (COD)",
    payload.Transaction_ID || payload.transaction_id || "N/A",
    payload.Payment_Status || payload.payment_status || "Pending",
    payload.Order_Status || payload.order_status || "Order Placed",
    Number(payload.Reseller_Commission !== undefined ? payload.Reseller_Commission : (payload.reseller_commission || 0)),
    payload.Commission_Status || payload.commission_status || "Pending"
  ];

  // Deduplicate by OrderID so an order NEVER shows up 5 times in the sheet!
  var res = writeOrUpsertRow(sheet, row, function(r) {
    var existingOrderId = String(r[1] || "").trim().toLowerCase();
    return existingOrderId !== "" && existingOrderId === orderId.toLowerCase();
  }, 5);

  // Clean up any matching draft in Incomplete_Orders for this customer phone
  if (normPhone) {
    try {
      var incSheet = findSheetCaseInsensitive(ss, "Incomplete_Orders");
      if (incSheet && incSheet.getLastRow() > 1) {
        var incData = incSheet.getRange(1, 1, incSheet.getLastRow(), 9).getValues();
        for (var k = incData.length - 1; k >= 1; k--) {
          if (normalizePhoneStr(incData[k][4]) === normPhone) {
            incSheet.deleteRow(k + 1);
          }
        }
      }
    } catch (cleanErr) {}
  }

  if (!res.updated) {
    sendOrderReminderEmail(orderId, payload, dateStr);
  }

  return {
    status: "success",
    success: true,
    data: { order_id: orderId, row: res.row },
    message: "অর্ডার সফলভাবে শিটে জমা হয়েছে!"
  };
}

function handleOrderStatusUpdate(ss, payload) {
  var sheet = findSheetCaseInsensitive(ss, "Orders");
  if (!sheet) return { status: "error", message: "Orders sheet not found" };

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: "error", message: "Orders sheet is empty" };
  var data = sheet.getRange(1, 1, lastRow, 17).getValues();
  var orderId = String(payload.order_id || payload.orderId || payload.OrderID || payload.id || "").trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === orderId.toLowerCase()) {
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
      if (payload.reseller_commission !== undefined) sheet.getRange(i + 1, 16).setValue(Number(payload.reseller_commission));
      if (payload.commission_status !== undefined) sheet.getRange(i + 1, 17).setValue(payload.commission_status);
      SpreadsheetApp.flush();
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
  var normP = normalizePhoneStr(phone);

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

  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rId = String(r[1] || "").trim().toLowerCase();
    var rPhone = normalizePhoneStr(r[4]);
    return (rId && rId === incId.toLowerCase()) || (normP && rPhone === normP);
  }, 5);

  return { status: "success", success: true, data: { order_id: incId, updated: res.updated } };
}

function handleResellerUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Resellers", [
    "Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "NID_Number", "Date_of_birth", "Trade_Licence_No", "User_ID", "Password", "Status"
  ]);

  var shopId = String(payload.Shop_ID || payload.shop_id || payload.id || ("RSL-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var mobile = String(payload.Mobile || payload.mobile || payload.phone || "").trim();
  var normMob = normalizePhoneStr(mobile);
  var userId = String(payload.User_ID || payload.user_id || mobile || shopId).trim();

  var row = [
    shopId,
    String(payload.Shop_logo || payload.shop_logo || payload.logo || ""),
    String(payload.Name || payload.name || ""),
    mobile,
    String(payload.Mail || payload.mail || payload.email || ""),
    String(payload.Address || payload.address || payload.city || ""),
    String(payload.Shop_Name || payload.shop_name || payload.shop || ""),
    String(payload.NID_Number || payload.nid_number || ""),
    String(payload.Date_of_birth || payload.date_of_birth || ""),
    String(payload.Trade_Licence_No || payload.trade_licence_no || ""),
    userId,
    String(payload.Password || payload.password || "123456"),
    String(payload.Status || payload.status || "Active")
  ];

  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rId = String(r[0] || "").trim().toLowerCase();
    var rMob = normalizePhoneStr(r[3]);
    return rId === shopId.toLowerCase() || (normMob && rMob === normMob);
  }, 4);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Reseller updated in Sheet!" : "Reseller added to Sheet!",
    data: { shop_id: shopId }
  };
}

function handleWholesalerUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Wholesalers", [
    "Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "User_ID", "Password", "Status"
  ]);

  var shopId = String(payload.Shop_ID || payload.shop_id || payload.id || ("WHS-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var mobile = String(payload.Mobile || payload.mobile || payload.phone || "").trim();
  var normMob = normalizePhoneStr(mobile);
  var userId = String(payload.User_ID || payload.user_id || mobile || shopId).trim();

  var row = [
    shopId,
    String(payload.Shop_logo || payload.shop_logo || payload.logo || ""),
    String(payload.Name || payload.name || ""),
    mobile,
    String(payload.Mail || payload.mail || payload.email || ""),
    String(payload.Address || payload.address || ""),
    String(payload.Shop_Name || payload.shop_name || payload.company || ""),
    userId,
    String(payload.Password || payload.password || "123456"),
    String(payload.Status || payload.status || "Approved")
  ];

  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rId = String(r[0] || "").trim().toLowerCase();
    var rMob = normalizePhoneStr(r[3]);
    return rId === shopId.toLowerCase() || (normMob && rMob === normMob);
  }, 4);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Wholesaler updated in Sheet!" : "Wholesaler added to Sheet!",
    data: { shop_id: shopId }
  };
}

function handlePartnerLogin(ss, sheetName, payload, roleName) {
  var sheet = findSheetCaseInsensitive(ss, sheetName);
  if (!sheet || sheet.getLastRow() <= 1) {
    return { status: "error", success: false, message: sheetName + " শিট পাওয়া যায়নি।" };
  }
  var idInput = String(payload.phone || payload.mobile || payload.identifier || payload.user_id || "").trim();
  var normP = normalizePhoneStr(idInput);
  var pass = String(payload.password || "").trim();

  var data = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var rShopId = String(r[0] || "").trim().toLowerCase();
    var rMob = normalizePhoneStr(r[3]);
    var rMail = String(r[4] || "").trim().toLowerCase();
    var rUserId = String(sheetName === "Resellers" ? r[10] : r[7] || "").trim().toLowerCase();
    var rPass = String(sheetName === "Resellers" ? r[11] : r[8] || "").trim();

    if ((normP && rMob === normP) || (idInput && (rShopId === idInput.toLowerCase() || rMail === idInput.toLowerCase() || rUserId === idInput.toLowerCase()))) {
      if (pass && rPass && rPass !== pass) {
        return { status: "error", success: false, message: "ভুল পাসওয়ার্ড!" };
      }
      return {
        status: "success",
        success: true,
        data: {
          shop_id: r[0],
          shop_logo: r[1],
          name: r[2],
          mobile: r[3],
          phone: r[3],
          mail: r[4],
          address: r[5],
          shop_name: r[6],
          account_type: roleName
        }
      };
    }
  }
  return { status: "error", success: false, message: "অ্যাকাউন্ট পাওয়া যায়নি।" };
}

function handleOthersMarketUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Others_Market", [
    "Shop_ID", "Market_Logo", "Market_Name", "Shop_Name", "Shop_Link", "Status"
  ]);

  var shopId = String(payload.Shop_ID || payload.shop_id || payload.id || ("MKT-" + Math.floor(100 + Math.random() * 900))).trim();
  var row = [
    shopId,
    String(payload.Market_Logo || payload.market_logo || ""),
    String(payload.Market_Name || payload.market_name || payload.name || ""),
    String(payload.Shop_Name || payload.shop_name || "Dream Cart BD"),
    String(payload.Shop_Link || payload.shop_link || ""),
    String(payload.Status !== undefined ? payload.Status : (payload.status || "Active"))
  ];

  var res = writeOrUpsertRow(sheet, row, function(r) {
    return String(r[0] || "").trim().toLowerCase() === shopId.toLowerCase();
  }, 3);

  return { status: "success", success: true, data: { shop_id: shopId, updated: res.updated } };
}

function handleAdminWorkerUpsert(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "AdminWorker", [
    "USER_ID", "Profile_Photo", "Name", "Mobile", "Mail", "Address", "Worker_Type", "Role", "User_Name", "Password"
  ]);

  var userId = String(payload.USER_ID || payload.user_id || payload.id || ("USR-" + Math.floor(100 + Math.random() * 900))).trim();
  var row = [
    userId,
    String(payload.Profile_Photo || payload.profile_photo || ""),
    String(payload.Name || payload.name || ""),
    String(payload.Mobile || payload.mobile || payload.phone || ""),
    String(payload.Mail || payload.mail || payload.email || ""),
    String(payload.Address || payload.address || ""),
    String(payload.Worker_Type || payload.worker_type || "Admin"),
    String(payload.Role || payload.role || "Full Access"),
    String(payload.User_Name || payload.user_name || payload.Name || payload.name || ""),
    String(payload.Password || payload.password || "admin123")
  ];

  var res = writeOrUpsertRow(sheet, row, function(r) {
    return String(r[0] || "").trim().toLowerCase() === userId.toLowerCase();
  }, 4);

  return { status: "success", success: true, data: { user_id: userId, updated: res.updated } };
}

function handleBuyingAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Buying", [
    "Date", "Who Buy", "Product Name", "buying price", "Quantity", "Total buying (calculated)", "Supplier", "Location"
  ]);
  var dateStr = payload.date || nowDhaka().slice(0, 10);
  var qty = Number(payload.quantity || 1);
  var unitPrice = Number(payload.buying_price || (payload.total_amount ? Math.round(Number(payload.total_amount) / Math.max(1, qty)) : 0));
  var total = Number(payload.total_amount || payload.total_buying || (unitPrice * qty));

  var row = [
    dateStr,
    payload.who_buy || "Admin",
    payload.product_name || payload.product || "",
    unitPrice,
    qty,
    total,
    payload.supplier || "",
    payload.location || "Dhaka/Cumilla"
  ];
  writeOrUpsertRow(sheet, row, null, 3);
  return { status: "success", success: true };
}

function handleCostAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Costs", [
    "Date", "Who Paid", "Purpose", "Amount", "Note"
  ]);
  var dateStr = payload.date || nowDhaka().slice(0, 10);
  var row = [
    dateStr,
    payload.who_paid || "Admin",
    payload.purpose || payload.title || "",
    Number(payload.amount || 0),
    payload.note || payload.category || ""
  ];
  writeOrUpsertRow(sheet, row, null, 3);
  return { status: "success", success: true };
}

function handleInvestAdd(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Invest", [
    "Date", "Invest type", "Name of investor", "Amount", "Note"
  ]);
  var dateStr = payload.date || nowDhaka().slice(0, 10);
  var row = [
    dateStr,
    payload.invest_type || "Working Capital",
    payload.investor || payload.name_of_investor || "",
    Number(payload.amount || 0),
    payload.note || ""
  ];
  writeOrUpsertRow(sheet, row, null, 3);
  return { status: "success", success: true };
}

function handlePaymentAdd(ss, payload) {
  // Exact 10 columns in Dream Cart BD-Site.xlsx -> Payments:
  // ['Request_ID', 'Reseller_ID', 'Reseller_Name', 'Payment_Method', 'Account_Details', 'Amount', 'Net_Amount_Less_3Percent', 'Status', 'Date', 'Transaction_ID']
  var sheet = ensureSheetWithHeaders(ss, "Payments", [
    "Request_ID", "Reseller_ID", "Reseller_Name", "Payment_Method", "Account_Details",
    "Amount", "Net_Amount_Less_3Percent", "Status", "Date", "Transaction_ID"
  ]);
  var reqId = String(payload.Request_ID || payload.request_id || payload.id || ("WDR-" + Math.floor(100000 + Math.random() * 900000))).trim();
  var amt = Number(payload.Amount || payload.amount || 0);
  var netAmt = Number(payload.Net_Amount_Less_3Percent || payload.net_amount || Math.round(amt * 0.97));
  var dateStr = payload.Date || payload.date || nowDhaka();

  var row = [
    reqId,
    String(payload.Reseller_ID || payload.reseller_id || payload.shop_id || "RSL-101"),
    String(payload.Reseller_Name || payload.reseller_name || payload.name || "Reseller"),
    String(payload.Payment_Method || payload.payment_method || payload.method || "bKash"),
    String(payload.Account_Details || payload.account_details || payload.account_number || ""),
    amt,
    netAmt,
    String(payload.Status || payload.status || "Pending"),
    dateStr,
    String(payload.Transaction_ID || payload.transaction_id || payload.trx_id || "N/A")
  ];

  writeOrUpsertRow(sheet, row, function(r) {
    return String(r[0] || "").trim().toLowerCase() === reqId.toLowerCase();
  }, 3);
  return { status: "success", success: true, data: { request_id: reqId } };
}

function handleCourierSendOrder(ss, payload) {
  handleOrderStatusUpdate(ss, {
    order_id: payload.order_id,
    order_status: "Shipped"
  });
  var logSheet = ensureSheetWithHeaders(ss, "Worker-Logs", [
    "Log_ID", "Timestamp", "User_ID", "User_Name", "Role", "Action", "Details", "IP_Address"
  ]);
  var logRow = [
    "LOG-" + Math.floor(100000 + Math.random() * 900000),
    nowDhaka(),
    payload.user_id || "ADM-01",
    payload.worker_name || "Admin",
    payload.role || "Admin",
    "Courier Booking (" + (payload.courier_name || "Steadfast") + ")",
    "Order: " + payload.order_id + " | Consignment: " + (payload.consignment_id || ""),
    payload.ip || "System"
  ];
  writeOrUpsertRow(logSheet, logRow, null, 3);
  return { status: "success", success: true, consignment_id: payload.consignment_id };
}

function handleGenericDelete(ss, sheetName, matchColIndices, targetVal) {
  var sheet = findSheetCaseInsensitive(ss, sheetName);
  if (!sheet || !targetVal) return { status: "error", message: "Sheet or target ID not found" };
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: "error", message: "Sheet is empty" };
  var maxCol = Math.max.apply(null, matchColIndices) + 1;
  var data = sheet.getRange(1, 1, lastRow, Math.max(maxCol, 3)).getValues();
  var targetStr = String(targetVal).trim().toLowerCase();
  var deletedCount = 0;
  for (var i = data.length - 1; i >= 1; i--) {
    for (var c = 0; c < matchColIndices.length; c++) {
      var colIdx = matchColIndices[c];
      if (String(data[i][colIdx] || "").trim().toLowerCase() === targetStr) {
        sheet.deleteRow(i + 1);
        deletedCount++;
        break;
      }
    }
  }
  if (deletedCount > 0) {
    SpreadsheetApp.flush();
    return { status: "success", success: true, message: sheetName + " row deleted (" + deletedCount + ")" };
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
  var row = [
    nowDhaka(),
    payload.ip || "ClientIP",
    payload.address || "Bangladesh",
    payload.name || "Guest",
    payload.phone || "N/A",
    payload.device || "Mobile/Desktop",
    payload.activity || "Page View"
  ];
  writeOrUpsertRow(sheet, row, null, 3);
  return { status: "success", success: true };
}

function handleSettingsUpdate(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Settings", ["Name", "Details", "Activation"]);
  var name = String(payload.name || payload.Name || "").trim();

  // Support key-value object updates (e.g., { reseller_settings: "..." })
  if (!name && payload && typeof payload === "object") {
    var keys = Object.keys(payload).filter(function(k) {
      return k !== "action" && k !== "spreadsheet_id" && k !== "_req_id";
    });
    if (keys.length > 0) {
      keys.forEach(function(k) {
        var val = typeof payload[k] === "object" ? JSON.stringify(payload[k]) : String(payload[k]);
        writeOrUpsertRow(sheet, [k, val, "TRUE"], function(r) {
          return String(r[0] || "").trim().toLowerCase() === k.toLowerCase();
        }, 2);
      });
      return { status: "success", success: true, message: "Settings batch updated" };
    }
  }

  if (!name) return { status: "error", message: "Setting Name required" };
  var details = typeof payload.details === "object" ? JSON.stringify(payload.details) : String(payload.details !== undefined ? payload.details : (payload.Details || ""));
  var activation = payload.activation !== undefined ? String(payload.activation) : (payload.Activation !== undefined ? String(payload.Activation) : "TRUE");

  var res = writeOrUpsertRow(sheet, [name, details, activation], function(r) {
    return String(r[0] || "").trim().toLowerCase() === name.toLowerCase();
  }, 2);

  return { status: "success", success: true, message: res.updated ? "Setting updated" : "Setting created" };
}

function handleBannerAdd(ss, payload) {
  // Exact 7 columns in Dream Cart BD-Site.xlsx -> Banners:
  // ['Banner_ID', 'Title', 'Image_URL', 'Link', 'Sort_Order', 'Status', 'Created_At']
  var sheet = ensureSheetWithHeaders(ss, "Banners", [
    "Banner_ID", "Title", "Image_URL", "Link", "Sort_Order", "Status", "Created_At"
  ]);
  var bId = String(payload.Banner_ID || payload.banner_id || payload.id || ("BAN-" + Math.floor(100 + Math.random() * 900))).trim();
  var title = String(payload.Title || payload.title || "ব্যানার স্লাইডার").trim();
  var img = String(payload.Image_URL || payload.image_url || payload.image || "").trim();
  var link = String(payload.Link || payload.link_url || payload.link || "/products").trim();
  var sortOrder = Number(payload.Sort_Order !== undefined ? payload.Sort_Order : (payload.position || 1));
  var status = String(payload.Status || payload.status || "Active").trim();
  var createdAt = String(payload.Created_At || payload.created_at || nowDhaka());

  var row = [bId, title, img, link, sortOrder, status, createdAt];
  var res = writeOrUpsertRow(sheet, row, function(r) {
    return String(r[0] || "").trim().toLowerCase() === bId.toLowerCase();
  }, 3);

  return {
    status: "success",
    success: true,
    message: res.updated ? "Banner updated in Sheet!" : "Banner added to Sheet!",
    data: { banner_id: bId, title: title, image_url: img, link_url: link, position: sortOrder, status: status }
  };
}

function handleReviewAdd(ss, payload) {
  // Exact 8 columns in Dream Cart BD-Site.xlsx -> Reviews:
  // ['Review_ID', 'Product_SKU', 'Customer_Name', 'Rating', 'Comment', 'Image', 'Status', 'Date']
  var sheet = ensureSheetWithHeaders(ss, "Reviews", [
    "Review_ID", "Product_SKU", "Customer_Name", "Rating", "Comment", "Image", "Status", "Date"
  ]);
  var revId = String(payload.Review_ID || payload.review_id || payload.id || ("REV-" + Math.floor(1000 + Math.random() * 9000))).trim();
  var row = [
    revId,
    String(payload.Product_SKU || payload.product_sku || payload.product || ""),
    String(payload.Customer_Name || payload.customer_name || payload.customer || "গ্রাহক"),
    Number(payload.Rating || payload.rating || 5),
    String(payload.Comment || payload.comment || ""),
    String(payload.Image || payload.image || ""),
    String(payload.Status || payload.status || "Approved"),
    String(payload.Date || payload.date || nowDhaka())
  ];
  writeOrUpsertRow(sheet, row, function(r) {
    return String(r[0] || "").trim().toLowerCase() === revId.toLowerCase();
  }, 3);
  return { status: "success", success: true, data: { review_id: revId } };
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

function getSheetDataAsJson(ss, sheetName, opts) {
  if (!ss) ss = getActiveSs();
  var sheet = findSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    return { status: "success", success: true, data: { items: [], total: 0 } };
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) {
    return { status: "success", success: true, data: { items: [], total: 0 } };
  }

  // Cap columns at 23 for Products so formula helper columns X..AB are not transferred
  var readCols = String(sheetName).toLowerCase() === "products" ? Math.min(lastCol, 23) : lastCol;
  var data = sheet.getRange(1, 1, lastRow, readCols).getValues();
  var headers = data[0];
  var isCompactProducts = opts && opts.compactProducts && String(sheetName).toLowerCase() === "products";

  var items = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Require at least one of the first 3 columns to be non-empty and not just an unchecked checkbox (false)
    var hasPrimaryContent = false;
    for (var c = 0; c < Math.min(4, row.length); c++) {
      if (row[c] !== "" && row[c] !== null && row[c] !== undefined && row[c] !== false) {
        if (String(row[c]).trim() !== "") {
          hasPrimaryContent = true;
          break;
        }
      }
    }
    if (!hasPrimaryContent) continue;

    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var rawH = String(headers[h] || ("col_" + h)).trim();
      var key = rawH.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      var cellVal = row[h];
      // Omit huge essay fields on compact catalog list so JSONP payload stays < 500 KB
      if (isCompactProducts && (h === 14 || h === 15 || h === 16)) {
        cellVal = "";
      }
      obj[key] = cellVal;
      obj[rawH] = cellVal;
      obj["col_" + h] = cellVal;
    }
    items.push(obj);
  }

  return {
    status: "success",
    success: true,
    data: { items: items, total: items.length }
  };
}

function setupAllSystemSheets(ss) {
  if (!ss) ss = getActiveSs();
  var definitions = [
    { name: "Attributes", headers: ["Date", "Type", "Name_Value", "Status"] },
    { name: "Sellers", headers: ["Shop_ID", "Shop_logo", "Shop_Name", "Name", "Mobile", "Mail", "Address", "Commission_Rate", "Status"] },
    { name: "Products", headers: ["SKU", "P_Name", "Category", "Sub_Category", "Child_Category", "Brand", "Buying_price", "Selling_Price", "Stock", "Original_Price", "WholeSale_price", "Min_order_Q", "Images", "Slug", "Description", "Specification", "Others", "Color", "Size", "WEIGHT_KG", "WIDTH_CM", "LENGTH_CM", "HEIGHT_CM"] },
    { name: "Categories", headers: ["Catagory_ID", "Catagory_Slug", "Category_Image", "Category", "Sub_Category", "Chail_Category"] },
    { name: "Brands", headers: ["Brand_ID", "Brand_Image", "Brand_Name", "Brand_Slug", "Brand_Description"] },
    { name: "Orders", headers: ["Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address", "Products", "Color", "Size", "Quantity", "Total_Amount", "Payment_method", "Transaction_ID", "Payment_Status", "Order_Status", "Reseller_Commission", "Commission_Status"] },
    { name: "Incomplete_Orders", headers: ["Date", "OrderID", "Account_type", "Customer_Name", "Phone", "Address", "Products", "Total_Amount", "Status"] },
    { name: "Viewers", headers: ["Time", "IP", "Address", "Name", "Phone", "Device", "Activity"] },
    { name: "Customers", headers: ["Customer_ID", "Profile_photo", "Name", "Mobile", "Mail", "Address", "User_ID", "Password", "Status", "Success_order", "Cancel_Order", "Total_Order", "Order_Success_Rate"] },
    { name: "Resellers", headers: ["Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "NID_Number", "Date_of_birth", "Trade_Licence_No", "User_ID", "Password", "Status"] },
    { name: "Wholesalers", headers: ["Shop_ID", "Shop_logo", "Name", "Mobile", "Mail", "Address", "Shop_Name", "User_ID", "Password", "Status"] },
    { name: "Buying", headers: ["Date", "Who Buy", "Product Name", "buying price", "Quantity", "Total buying (calculated)", "Supplier", "Location"] },
    { name: "Costs", headers: ["Date", "Who Paid", "Purpose", "Amount", "Note"] },
    { name: "Invest", headers: ["Date", "Invest type", "Name of investor", "Amount", "Note"] },
    { name: "Others_Market", headers: ["Shop_ID", "Market_Logo", "Market_Name", "Shop_Name", "Shop_Link", "Status"] },
    { name: "AdminWorker", headers: ["USER_ID", "Profile_Photo", "Name", "Mobile", "Mail", "Address", "Worker_Type", "Role", "User_Name", "Password"] },
    { name: "Settings", headers: ["Name", "Details", "Activation"] },
    { name: "Banners", headers: ["Banner_ID", "Title", "Image_URL", "Link", "Sort_Order", "Status", "Created_At"] },
    { name: "Reviews", headers: ["Review_ID", "Product_SKU", "Customer_Name", "Rating", "Comment", "Image", "Status", "Date"] },
    { name: "Payments", headers: ["Request_ID", "Reseller_ID", "Reseller_Name", "Payment_Method", "Account_Details", "Amount", "Net_Amount_Less_3Percent", "Status", "Date", "Transaction_ID"] },
    { name: "Landing-Pages", headers: ["Slug", "Slogan", "Main_Link", "Products", "Product_Images", "Review_Images", "Contact_Call", "Contact_Whatsapp", "Contact_Mail", "Social_Icons", "Status"] },
    { name: "Worker-Logs", headers: ["Log_ID", "Timestamp", "User_ID", "User_Name", "Role", "Action", "Details", "IP_Address"] }
  ];

  definitions.forEach(function(item) {
    ensureSheetWithHeaders(ss, item.name, item.headers);
  });

  return { status: "success", success: true, message: "All 22 system sheets successfully initialized!" };
}

function handleCustomerRegistration(ss, payload) {
  var sheet = ensureSheetWithHeaders(ss, "Customers", [
    "Customer_ID", "Profile_photo", "Name", "Mobile", "Mail", "Address", "User_ID", "Password", "Status", "Success_order", "Cancel_Order", "Total_Order", "Order_Success_Rate"
  ]);

  var rawPhone = String(payload.Mobile || payload.mobile || payload.phone || "").trim();
  var cleanPhone = normalizePhoneStr(rawPhone);
  var rawMail = String(payload.Mail || payload.mail || payload.email || "").trim().toLowerCase();
  var rawPass = String(payload.Password || payload.password || "123456").trim();
  var rawName = String(payload.Name || payload.name || "সম্মানিত গ্রাহক").trim();
  var rawAddr = String(payload.Address || payload.address || "").trim();
  var rawPhoto = String(payload.Profile_photo || payload.profile_photo || "").trim();
  var userId = String(payload.Customer_ID || payload.USER_ID || payload.user_id || ("CUST-" + Math.floor(100000 + Math.random() * 900000))).trim();

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

  var res = writeOrUpsertRow(sheet, row, function(r) {
    var rowMobile = normalizePhoneStr(r[3]);
    var rowId = String(r[0] || "").trim().toLowerCase();
    return (cleanPhone && rowMobile === cleanPhone) || (rowId && rowId === userId.toLowerCase());
  }, 4);

  return {
    status: "success",
    success: true,
    message: res.updated ? "কাস্টমার তথ্য আপডেট হয়েছে!" : "কাস্টমার অ্যাকাউন্ট সফলভাবে শিটে জমা হয়েছে!",
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
      status: "Active"
    }
  };
}

function handleCustomerLogin(ss, payload) {
  var sheet = findSheetCaseInsensitive(ss, "Customers");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { status: "error", success: false, message: "Customers শিট পাওয়া যায়নি।" };
  }

  var identifier = String(payload.phone || payload.mobile || payload.identifier || payload.mail || payload.email || payload.username || "").trim();
  var inputPass = String(payload.password || "").trim();
  var cleanPhone = normalizePhoneStr(identifier);
  var cleanMail = identifier.toLowerCase();

  var data = sheet.getRange(1, 1, sheet.getLastRow(), 13).getValues();
  for (var i = 1; i < data.length; i++) {
    var rUserIdA = String(data[i][0] || "").trim().toLowerCase();
    var rPhoto = String(data[i][1] || "").trim();
    var rName = String(data[i][2] || "").trim();
    var rMobile = normalizePhoneStr(data[i][3]);
    var rMail = String(data[i][4] || "").trim().toLowerCase();
    var rAddr = String(data[i][5] || "").trim();
    var rUserIdG = String(data[i][6] || "").trim().toLowerCase();
    var rPass = String(data[i][7] || "").trim();
    var rStatus = String(data[i][8] || "Active").trim();

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
      return {
        status: "success",
        success: true,
        message: "লগইন সফল হয়েছে!",
        data: {
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
          success_order: Number(data[i][9] || 0),
          cancel_order: Number(data[i][10] || 0),
          total_order: Number(data[i][11] || 0),
          order_success_rate: String(data[i][12] || "100%").trim(),
          account_type: "CUSTOMER",
          role: "Customer"
        }
      };
    }
  }

  return {
    status: "error",
    success: false,
    message: "মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। Customers তালিকায় আপনার তথ্য পাওয়া যায়নি।"
  };
}
