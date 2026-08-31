/**
 * ============================================================================
 * DREAM CART BD — MASTER API GATEWAY & ROUTER (Code.js)
 * Connected Spreadsheet ID: 19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc
 * ============================================================================
 */

const CONFIG = {
  SPREADSHEET_ID: "19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc",
  DRIVE_ROOT_FOLDER: "Dream-Cart-BD",
  JWT_SECRET: "DCBD_ENTERPRISE_SECRET_KEY_2026_PROD",
  CACHE_TTL_SEC: 300,        // ৫ মিনিট স্ক্রিপ্ট ক্যাশ
  LOCK_TIMEOUT_MS: 15000     // ১৫ সেকেন্ড কনকারেন্সি লক
};

/**
 * GET রিকোয়েস্ট হ্যান্ডলার
 */
function doGet(e) {
  return handleApiRequest(e, "GET");
}

/**
 * POST রিকোয়েস্ট হ্যান্ডলার
 */
function doPost(e) {
  return handleApiRequest(e, "POST");
}

/**
 * সেন্ট্রাল রিকোয়েস্ট প্রসেসর
 */
function handleApiRequest(e, method) {
  const requestId = "REQ-" + Utilities.getUuid().substring(0, 8);
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
    Logger.log(`[Error] Request ID: ${requestId} | Message: ${error.message} | Stack: ${error.stack}`);
    return createApiResponse(false, null, "EXECUTION_ERROR", error.message || "Internal Server Error", 500, requestId);
  }
}

/**
 * স্ট্যান্ডার্ড JSON রেসপন্স বিল্ডার
 */
function createApiResponse(ok, data, errorCode, message, statusCode, requestId) {
  const responsePayload = {
    ok: ok,
    status: statusCode,
    requestId: requestId,
    timestamp: new Date().toISOString(),
    data: data,
    error: ok ? null : { code: errorCode, message: message }
  };

  return ContentService.createTextOutput(JSON.stringify(responsePayload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * মাস্টার API ডিসপ্যাচার ও রাউটার
 */
const ApiRouter = {
  execute: function(action, method, params, body, requestId) {
    switch (action) {

      // ==================== SYSTEM & TWO-WAY SYNC ====================
      case "system.init":
        return Database.initializeAllSheets();

      case "system.health":
        return {
          status: "HEALTHY",
          tablesInitialized: Database.getAllTableNames().length,
          lastSheetUpdate: PropertiesService.getScriptProperties().getProperty("LAST_SHEET_UPDATE") || new Date().toISOString(),
          serverTimestamp: new Date().toISOString()
        };

      case "sync.getStatus":
        return {
          lastSheetUpdate: PropertiesService.getScriptProperties().getProperty("LAST_SHEET_UPDATE") || new Date().toISOString(),
          serverTime: new Date().toISOString()
        };

      // ==================== AUTHENTICATION & RBAC ====================
      case "auth.login":
        return AuthService.login(body.identifier || body.email || body.phone, body.password);

      case "auth.register":
        return AuthService.register(body);

      case "auth.verifyToken":
        return AuthService.verifyToken(body.token);

      // ==================== PRODUCTS & INLINE EDITING ====================
      case "products.list":
        return Database.getAllRows("Products");

      case "products.get":
        return Database.getRowByKey("Products", "product_id", params.productId || params.id || body.productId);

      case "products.create":
        body.product_id = "PRD-" + Utilities.getUuid().substring(0, 8);
        body.created_at = new Date().toISOString();
        body.updated_at = new Date().toISOString();
        Database.insertRow("Products", body);
        Database.logAudit(body.userId || "ADMIN", "CREATE_PRODUCT", "Product", body.product_id, "", JSON.stringify(body), requestId);
        return body;

      case "products.update":
        body.updated_at = new Date().toISOString();
        Database.updateRowByKey("Products", "product_id", body.product_id, body);
        Database.logAudit(body.userId || "ADMIN", "UPDATE_PRODUCT", "Product", body.product_id, "", JSON.stringify(body), requestId);
        return body;

      // ইনলাইন প্রাইস আপডেট (টেবিল থেকে সরাসরি প্রাইস পরিবর্তন)
      case "products.inlineUpdatePrice": {
        const prod = Database.getRowByKey("Products", "product_id", body.productId);
        if (!prod) throw new Error("Product not found");
        const targetField = body.priceType || "selling_price";
        const oldPrice = prod[targetField];

        Database.updateRowByKey("Products", "product_id", body.productId, {
          [targetField]: Number(body.newPrice),
          updated_at: new Date().toISOString()
        });

        // মূল্য পরিবর্তনের রেকর্ড সংরক্ষণ
        Database.insertRow("Price_History", {
          history_id: "PRH-" + Utilities.getUuid().substring(0, 8),
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

      // ইনলাইন স্টক আপডেট (টেবিল থেকে সরাসরি স্টক পরিবর্তন)
      case "products.inlineUpdateStock": {
        const prod = Database.getRowByKey("Products", "product_id", body.productId);
        if (!prod) throw new Error("Product not found");
        const oldStock = Number(prod.stock || 0);
        const newStock = Number(body.newStock);

        Database.updateRowByKey("Products", "product_id", body.productId, {
          stock: newStock,
          updated_at: new Date().toISOString()
        });

        // স্টক মুভমেন্ট লেজারে সংরক্ষণ
        Database.insertRow("Stock_Movements", {
          movement_id: "MOV-" + Utilities.getUuid().substring(0, 8),
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
        Database.updateRowByKey("Orders", "order_id", body.orderId, {
          order_status: body.status,
          updated_at: new Date().toISOString()
        });
        Database.logAudit(body.userId || "ADMIN", "ORDER_STATUS_UPDATE", "Order", body.orderId, "", body.status, requestId);
        return { success: true, orderId: body.orderId, status: body.status };

      case "fraud.check":
        return FraudEngine.evaluateCustomerRisk(body.phone, body.orderId);

      // ==================== INVENTORY & SUPPLIERS ====================
      case "inventory.list":
        return Database.getAllRows("Inventory");

      case "inventory.movements":
        return Database.getAllRows("Stock_Movements");

      case "suppliers.list":
        return Database.getAllRows("Suppliers");

      case "purchases.list":
        return Database.getAllRows("Purchases");

      // ==================== PARTNER PORTALS ====================
      case "sellers.list":
        return Database.getAllRows("Sellers");

      case "resellers.list":
        return Database.getAllRows("Resellers");

      case "wholesalers.list":
        return Database.getAllRows("Wholesalers");

      // ==================== AUDIT & SETTINGS ====================
      case "audit.list":
        return Database.getAllRows("Audit_Logs");

      case "settings.get":
        return Database.getAllRows("Settings");

      case "settings.update":
        Database.updateRowByKey("Settings", "key", body.key, {
          value: body.value,
          updated_at: new Date().toISOString()
        });
        return { success: true, key: body.key, value: body.value };

      default:
        throw new Error(`API Action '${action}' is not supported.`);
    }
  }
};

/**
 * ক্যাটাগরি হায়ারার্কি বিল্ডার
 */
const CategoryEngine = {
  getFullCategoryTree: function() {
    const mainCategories = Database.getAllRows("Categories");
    const subCategories = Database.getAllRows("Sub_Categories");
    const childCategories = Database.getAllRows("Child_Categories");

    return mainCategories.map(main => {
      const subs = subCategories.filter(s => String(s.category_id) === String(main.category_id)).map(sub => {
        const children = childCategories.filter(c => String(c.sub_category_id) === String(sub.sub_category_id));
        return { ...sub, children: children };
      });
      return { ...main, subCategories: subs };
    });
  }
};

/**
 * অর্ডার প্রসেসিং ইঞ্জিন
 */
const OrderEngine = {
  createOrder: function(data, requestId) {
    const orderId = "ORD-" + Date.now().toString().slice(-6);
    const orderNumber = "DCBD-" + Math.floor(100000 + Math.random() * 900000);

    const orderRecord = {
      order_id: orderId,
      order_number: orderNumber,
      customer_id: data.customer_id || "GUEST",
      customer_name: data.customer_name || "",
      phone: data.phone || "",
      email: data.email || "",
      shipping_address: data.shipping_address || "",
      district: data.district || "",
      city: data.city || "",
      courier_id: data.courier_id || "STEADFAST",
      tracking_code: "",
      payment_method: data.payment_method || "COD",
      payment_status: data.payment_status || "unpaid",
      subtotal: Number(data.subtotal || 0),
      discount: Number(data.discount || 0),
      shipping_charge: Number(data.shipping_charge || 0),
      total: Number(data.total || 0),
      order_status: "pending",
      fraud_score: 0,
      fraud_status: "unchecked",
      source: data.source || "website",
      notes: data.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    Database.insertRow("Orders", orderRecord);

    // অর্ডার আইটেমসমূহ যুক্ত করা
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(item => {
        Database.insertRow("Order_Items", {
          item_id: "ITM-" + Utilities.getUuid().substring(0, 8),
          order_id: orderId,
          product_id: item.product_id || "",
          variant_id: item.variant_id || "",
          product_name: item.product_name || "",
          sku: item.sku || "",
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.unit_price || 0),
          purchase_cost: Number(item.purchase_cost || 0),
          total_price: Number(item.total_price || (item.unit_price * item.quantity))
        });
      });
    }

    Database.logAudit("CUSTOMER", "CREATE_ORDER", "Order", orderId, "", JSON.stringify(orderRecord), requestId);
    return orderRecord;
  }
};

/**
 * কুরিয়ার ও কাস্টমার ফ্রড ডিটেকশন ইঞ্জিন
 */
const FraudEngine = {
  evaluateCustomerRisk: function(phone, orderId) {
    if (!phone) throw new Error("Phone number is required for fraud check.");
    const cleanPhone = String(phone).replace(/\D/g, "");

    const pastOrders = Database.getAllRows("Orders").filter(o => String(o.phone).replace(/\D/g, "").includes(cleanPhone));
    const totalOrders = pastOrders.length;
    const deliveredOrders = pastOrders.filter(o => o.order_status === "delivered").length;
    const cancelledOrders = pastOrders.filter(o => o.order_status === "cancelled").length;
    const rtoOrders = pastOrders.filter(o => o.order_status === "rto" || o.order_status === "returned").length;

    let successRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 100;
    let rtoRate = totalOrders > 0 ? Math.round((rtoOrders / totalOrders) * 100) : 0;

    let riskScore = 15;
    let riskLevel = "SAFE";
    const riskReasons = [];

    if (totalOrders === 0) {
      riskLevel = "NEW_CUSTOMER";
      riskScore = 20;
      riskReasons.push("নতুন কাস্টমার — পূর্বে কোনো অর্ডারের হিস্ট্রি নেই");
    } else if (rtoRate >= 40) {
      riskScore = 85;
      riskLevel = "HIGH_RISK";
      riskReasons.push(`উচ্চ রিটার্ন রেশিও (${rtoRate}% RTO রেকর্ড)`);
    } else if (rtoRate >= 20 || cancelledOrders > deliveredOrders) {
      riskScore = 55;
      riskLevel = "MEDIUM_RISK";
      riskReasons.push("পূর্বে অর্ডার বাতিল বা ফেরত দেওয়ার রেকর্ড রয়েছে");
    } else {
      riskScore = 10;
      riskLevel = "SAFE";
      riskReasons.push("বিশ্বস্ত কাস্টমার — উচ্চ সফল ডেলিভারি রেকর্ড");
    }

    const checkRecord = {
      check_id: "CHK-" + Utilities.getUuid().substring(0, 8),
      phone: cleanPhone,
      order_id: orderId || "",
      total_orders: totalOrders,
      delivered_orders: deliveredOrders,
      cancelled_orders: cancelledOrders,
      rto_orders: rtoOrders,
      success_rate: successRate + "%",
      risk_score: riskScore,
      risk_level: riskLevel,
      checked_at: new Date().toISOString()
    };

    Database.insertRow("Courier_Checks", checkRecord);

    return {
      ...checkRecord,
      reasons: riskReasons
    };
  }
};
