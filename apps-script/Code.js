/* eslint-disable */
/* global Utilities, ContentService, Logger, PropertiesService, Database, AuthService */
/**
 * ============================================================================
 * DREAM CART BD — MASTER API GATEWAY & ROUTER (Code.js)
 * Connected Spreadsheet ID: 19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc
 * ============================================================================
 */

export const CONFIG = {
  SPREADSHEET_ID: "19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc",
  DRIVE_ROOT_FOLDER: "Dream-Cart-BD",
  JWT_SECRET: "DCBD_ENTERPRISE_SECRET_KEY_2026_PROD",
  CACHE_TTL_SEC: 300,        // ৫ মিনিট স্ক্রিপ্ট ক্যাশ
  LOCK_TIMEOUT_MS: 15000     // ১৫ সেকেন্ড কনকারেন্সি লক
};

/**
 * GET রিকোয়েস্ট হ্যান্ডলার
 */
export function doGet(e) {
  return handleApiRequest(e, "GET");
}

/**
 * POST রিকোয়েস্ট হ্যান্ডলার
 */
export function doPost(e) {
  return handleApiRequest(e, "POST");
}

/**
 * সেন্ট্রাল রিকোয়েস্ট প্রসেসর
 */
export function handleApiRequest(e, method) {
  const requestId = "REQ-" + ((typeof Utilities !== "undefined" && Utilities.getUuid) 
    ? Utilities.getUuid().substring(0, 8) 
    : Math.random().toString(36).substring(2, 10));

  try {
    const params = e && e.parameter ? e.parameter : {};
    let body = {};

    if (method === "POST" && e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        return createApiResponse(false, null, "INVALID_JSON", "Payload is not valid JSON", 400, requestId);
      }
    }

    const action = params.action || body.action;

    // কোনো অ্যাকশন না থাকলে সিস্টেম স্ট্যাটাস প্রদর্শন
    if (!action) {
      return createApiResponse(true, {
        status: "ONLINE",
        platform: "Dream Cart BD Headless Commerce OS",
        version: "2.0.0",
        connectedSpreadsheet: CONFIG.SPREADSHEET_ID,
        serverTime: new Date().toISOString()
      }, null, "Service Active and Ready", 200, requestId);
    }

    // রাউট এক্সিকিউশন
    const result = ApiRouter.execute(action, method, params, body, requestId);
    return createApiResponse(true, result, null, "Success", 200, requestId);

  } catch (error) {
    if (typeof Logger !== "undefined") {
      Logger.log(`[Error] Request ID: ${requestId} | Message: ${error.message} | Stack: ${error.stack}`);
    }
    return createApiResponse(false, null, "EXECUTION_ERROR", error.message || "Internal Server Error", 500, requestId);
  }
}

/**
 * স্ট্যান্ডার্ড JSON রেসপন্স বিল্ডার
 */
export function createApiResponse(ok, data, errorCode, message, statusCode, requestId) {
  const responsePayload = {
    ok: ok,
    status: statusCode,
    requestId: requestId,
    timestamp: new Date().toISOString(),
    data: data,
    error: ok ? null : { code: errorCode, message: message }
  };

  if (typeof ContentService !== "undefined") {
    return ContentService.createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return responsePayload;
}

/**
 * মাস্টার API ডিসপ্যাচার ও রাউটার
 */
export const ApiRouter = {
  execute: function(action, method, params, body, requestId) {
    if (typeof Database === "undefined") {
      return { status: "Database not initialized", action: action };
    }

    switch (action) {

      // ==================== SYSTEM & TWO-WAY SYNC ====================
      case "system.init":
        return Database.initializeAllSheets();

      case "system.health":
        return {
          status: "HEALTHY",
          tablesInitialized: Database.getAllTableNames().length,
          lastSheetUpdate: (typeof PropertiesService !== "undefined" && PropertiesService.getScriptProperties().getProperty("LAST_SHEET_UPDATE")) || new Date().toISOString(),
          serverTimestamp: new Date().toISOString()
        };

      case "sync.getStatus":
        return {
          lastSheetUpdate: (typeof PropertiesService !== "undefined" && PropertiesService.getScriptProperties().getProperty("LAST_SHEET_UPDATE")) || new Date().toISOString(),
          serverTime: new Date().toISOString()
        };

      // ==================== AUTHENTICATION & RBAC ====================
      case "auth.login":
        return typeof AuthService !== "undefined" ? AuthService.login(body.identifier || body.email || body.phone, body.password) : null;

      case "auth.register":
        return typeof AuthService !== "undefined" ? AuthService.register(body) : null;

      case "auth.verifyToken":
        return typeof AuthService !== "undefined" ? AuthService.verifyToken(body.token) : null;

      // ==================== PRODUCTS & INLINE EDITING ====================
      case "products.list":
        return Database.getAllRows("Products");

      case "products.get":
        return Database.getRowByKey("Products", "product_id", params.productId || params.id || body.productId);

      case "products.create": {
        const uuid = (typeof Utilities !== "undefined" && Utilities.getUuid) ? Utilities.getUuid().substring(0, 8) : Date.now().toString(36);
        body.product_id = "PRD-" + uuid;
        body.created_at = new Date().toISOString();
        body.updated_at = new Date().toISOString();
        Database.insertRow("Products", body);
        Database.logAudit(body.userId || "ADMIN", "CREATE_PRODUCT", "Product", body.product_id, "", JSON.stringify(body), requestId);
        return body;
      }

      case "products.update":
        body.updated_at = new Date().toISOString();
        Database.updateRowByKey("Products", "product_id", body.product_id, body);
        Database.logAudit(body.userId || "ADMIN", "UPDATE_PRODUCT", "Product", body.product_id, "", JSON.stringify(body), requestId);
        return body;

      // ইনলাইন প্রাইস আপডেট
      case "products.inlineUpdatePrice": {
        const prod = Database.getRowByKey("Products", "product_id", body.productId);
        if (!prod) throw new Error("Product not found");
        const targetField = body.priceType || "selling_price";
        const oldPrice = prod[targetField];
        const uuid = (typeof Utilities !== "undefined" && Utilities.getUuid) ? Utilities.getUuid().substring(0, 8) : Date.now().toString(36);

        Database.updateRowByKey("Products", "product_id", body.productId, {
          [targetField]: Number(body.newPrice),
          updated_at: new Date().toISOString()
        });

        // মূল্য পরিবর্তনের রেকর্ড সংরক্ষণ
        Database.insertRow("Price_History", {
          history_id: "PRH-" + uuid,
          product_id: body.productId,
          variant_id: body.variantId || "",
          old_price: oldPrice,
          new_price: body.newPrice,
          price_type: targetField,
          reason: body.reason || "Inline Table Edit",
          user_id: body.userId || "ADMIN",
          timestamp: new Date().toISOString()
        });

        Database.logAudit(body.userId || "ADMIN", "INLINE_PRICE_CHANGE", "Product", body.productId, String(oldPrice), String(body.newPrice), requestId);
        return { productId: body.productId, field: targetField, oldPrice: oldPrice, newPrice: body.newPrice };
      }

      // ইনলাইন স্টক আপডেট
      case "products.inlineUpdateStock": {
        const prod = Database.getRowByKey("Products", "product_id", body.productId);
        if (!prod) throw new Error("Product not found");
        const oldStock = Number(prod.stock || 0);
        const newStock = Number(body.newStock);
        const uuid = (typeof Utilities !== "undefined" && Utilities.getUuid) ? Utilities.getUuid().substring(0, 8) : Date.now().toString(36);

        Database.updateRowByKey("Products", "product_id", body.productId, {
          stock: newStock,
          updated_at: new Date().toISOString()
        });

        // স্টক মুভমেন্ট লেজারে সংরক্ষণ
        Database.insertRow("Stock_Movements", {
          movement_id: "MOV-" + uuid,
          product_id: body.productId,
          variant_id: body.variantId || "",
          sku: prod.sku || "",
          movement_type: "manual_inline_adjustment",
          quantity: Math.abs(newStock - oldStock),
          reference_id: "INLINE_EDIT",
          reason: body.reason || "Inline Stock Update",
          user_id: body.userId || "ADMIN",
          timestamp: new Date().toISOString()
        });

        Database.logAudit(body.userId || "ADMIN", "INLINE_STOCK_CHANGE", "Product", body.productId, String(oldStock), String(newStock), requestId);
        return { productId: body.productId, oldStock: oldStock, newStock: newStock };
      }

      // ==================== CATEGORIES & TAXONOMY ====================
      case "categories.list":
        return Database.getAllRows("Categories");

      case "subcategories.list":
        return Database.getAllRows("Sub_Categories");

      case "childcategories.list":
        return Database.getAllRows("Child_Categories");

      case "categories.getTree":
        return CategoryEngine.getFullCategoryTree();

      // ==================== ORDERS & FRAUD PREVENTION ====================
      case "orders.list":
        return Database.getAllRows("Orders");

      case "orders.get":
        return Database.getRowByKey("Orders", "order_id", params.orderId || body.orderId);

      case "orders.create":
        return OrderEngine.createOrder(body, requestId);

      case "orders.updateStatus":
        Database.updateRowByKey("Orders",
