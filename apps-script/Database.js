/**
 * ============================================================================
 * DREAM CART BD — DATABASE ENGINE & SCHEMA REPOSITORY (Database.js)
 * ============================================================================
 */

const Database = {
  getSpreadsheet: function() {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  },

  getTable: function(sheetName) {
    const ss = this.getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    return sheet;
  },

  getAllTableNames: function() {
    return this.getSpreadsheet().getSheets().map(s => s.getName());
  },

  // ৩০টিরও বেশি টেবিলের মাস্টার স্কিমা
  getSchemas: function() {
    return {
      "Products": ["product_id", "product_name", "slug", "product_type", "sku", "barcode", "category_id", "sub_category_id", "child_category_id", "brand_id", "purchase_price", "regular_price", "selling_price", "seller_price", "reseller_price", "wholesale_price", "stock", "reorder_level", "weight", "shipping_type", "shipping_charge", "thumbnail", "status", "created_at", "updated_at"],
      "Categories": ["category_id", "category_name", "slug", "description", "image", "icon", "sort_order", "status", "created_at", "updated_at"],
      "Sub_Categories": ["sub_category_id", "category_id", "name", "slug", "description", "image", "sort_order", "status", "created_at", "updated_at"],
      "Child_Categories": ["child_category_id", "category_id", "sub_category_id", "name", "slug", "description", "image", "sort_order", "status", "created_at", "updated_at"],
      "Product_Images": ["image_id", "product_id", "variant_id", "image_url", "drive_file_id", "sort_order", "is_primary", "created_at"],
      "Variants": ["variant_id", "product_id", "sku", "barcode", "variant_name", "option_1_name", "option_1_value", "option_2_name", "option_2_value", "selling_price", "stock", "image", "status", "created_at"],
      "Inventory": ["inventory_id", "product_id", "variant_id", "sku", "on_hand", "reserved", "available", "incoming", "damaged", "reorder_level", "status", "updated_at"],
      "Stock_Movements": ["movement_id", "product_id", "variant_id", "sku", "movement_type", "quantity", "reference_id", "reason", "user_id", "timestamp"],
      "Purchases": ["purchase_id", "po_number", "supplier_id", "total_amount", "paid_amount", "due_amount", "status", "created_at"],
      "Suppliers": ["supplier_id", "name", "company_name", "phone", "email", "address", "balance", "status", "created_at"],
      "Customers": ["customer_id", "user_id", "name", "phone", "email", "address", "city", "district", "total_orders", "successful_orders", "rto_orders", "status", "created_at"],
      "Leads": ["lead_id", "name", "phone", "source", "stage", "notes", "assigned_to", "created_at"],
      "Sellers": ["seller_id", "user_id", "business_name", "phone", "email", "commission_rate", "payable_balance", "status", "created_at"],
      "Resellers": ["reseller_id", "user_id", "business_name", "phone", "email", "pricing_tier", "payable_balance", "status", "created_at"],
      "Wholesalers": ["wholesale_id", "user_id", "business_name", "phone", "email", "moq", "credit_limit", "outstanding_balance", "status", "created_at"],
      "Orders": ["order_id", "order_number", "customer_id", "customer_name", "phone", "email", "shipping_address", "district", "city", "courier_id", "tracking_code", "payment_method", "payment_status", "subtotal", "discount", "shipping_charge", "total", "order_status", "fraud_score", "fraud_status", "source", "notes", "created_at", "updated_at"],
      "Order_Items": ["item_id", "order_id", "product_id", "variant_id", "product_name", "sku", "quantity", "unit_price", "purchase_cost", "total_price"],
      "Payments": ["payment_id", "order_id", "gateway", "transaction_id", "amount", "status", "callback_payload", "verified_at", "created_at"],
      "Refunds": ["refund_id", "order_id", "amount", "reason", "status", "processed_by", "created_at"],
      "Returns": ["return_id", "order_id", "product_id", "quantity", "reason", "condition", "status", "created_at"],
      "Couriers": ["courier_id", "name", "code", "api_key", "secret_key", "webhook_url", "is_active"],
      "Shipments": ["shipment_id", "order_id", "courier_id", "consignment_id", "tracking_code", "status", "created_at"],
      "Courier_Checks": ["check_id", "phone", "order_id", "total_orders", "delivered_orders", "cancelled_orders", "rto_orders", "success_rate", "risk_score", "risk_level", "checked_at"],
      "Pricing_Rules": ["rule_id", "category_id", "brand_id", "adjustment_type", "adjustment_value", "status", "created_at"],
      "Price_History": ["history_id", "product_id", "variant_id", "old_price", "new_price", "price_type", "reason", "user_id", "timestamp"],
      "Fraud_Rules": ["rule_id", "rule_type", "condition", "threshold", "action", "status"],
      "Coupons": ["coupon_id", "code", "discount_type", "discount_value", "min_order_amount", "max_discount", "usage_limit", "used_count", "start_date", "end_date", "status"],
      "Reviews": ["review_id", "product_id", "customer_name", "rating", "comment", "status", "created_at"],
      "Messages": ["message_id", "sender", "recipient", "channel", "template_name", "status", "sent_at"],
      "Notifications": ["notification_id", "user_id", "title", "message", "is_read", "created_at"],
      "Audit_Logs": ["log_id", "user_id", "action", "entity", "entity_id", "old_value", "new_value", "reason", "timestamp", "request_id"],
      "Jobs": ["job_id", "job_type", "payload", "status", "scheduled_at", "executed_at"],
      "Settings": ["setting_id", "group", "key", "value", "description", "updated_at"],
      "Feature_Flags": ["flag_id", "name", "key", "is_enabled", "description"],
      "Backups": ["backup_id", "file_name", "drive_file_id", "size_bytes", "created_at"],
      "Users": ["user_id", "name", "email", "phone", "password_hash", "user_type", "role", "status", "created_at", "updated_at"]
    };
  },

  // স্কিমা অনুযায়ী সমস্ত টেবিল শিটে তৈরি করার মেথড
  initializeAllSheets: function() {
    const ss = this.getSpreadsheet();
    const schemas = this.getSchemas();
    const created = [];

    for (const [sheetName, headers] of Object.entries(schemas)) {
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
        sheet.setFrozenRows(1);
        created.push(sheetName);
      }
    }
    return { status: "success", initialized: created, totalTables: Object.keys(schemas).length };
  },

  // টেবিলের সমস্ত ডাটা অবজেক্ট অ্যারে হিসেবে পড়া
  getAllRows: function(sheetName) {
    const sheet = this.getTable(sheetName);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const headers = data[0];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      let hasData = false;
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
        if (data[i][j] !== "") hasData = true;
      }
      if (hasData) {
        row._rowIndex = i + 1;
        rows.push(row);
      }
    }
    return rows;
  },

  // নির্দিষ্ট কী অনুযায়ী একক রো পড়া
  getRowByKey: function(sheetName, keyColumn, keyValue) {
    const rows = this.getAllRows(sheetName);
    return rows.find(r => String(r[keyColumn]) === String(keyValue)) || null;
  },

  // অ্যাটমিক লক সহ নতুন রো যুক্ত করা
  insertRow: function(sheetName, recordObj) {
    const lock = LockService.getScriptLock();
    lock.waitLock(CONFIG.LOCK_TIMEOUT_MS);
    try {
      const sheet = this.getTable(sheetName);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowValues = headers.map(h => recordObj[h] !== undefined ? recordObj[h] : "");
      sheet.appendRow(rowValues);
      return recordObj;
    } finally {
      lock.releaseLock();
    }
  },

  // অ্যাটমিক লক সহ রো আপডেট করা
  updateRowByKey: function(sheetName, keyColumn, keyValue, updateObj) {
    const lock = LockService.getScriptLock();
    lock.waitLock(CONFIG.LOCK_TIMEOUT_MS);
    try {
      const sheet = this.getTable(sheetName);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const keyColIndex = headers.indexOf(keyColumn);

      if (keyColIndex === -1) throw new Error(`Column '${keyColumn}' missing in '${sheetName}'`);

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][keyColIndex]) === String(keyValue)) {
          const rowNum = i + 1;
          for (const [colName, val] of Object.entries(updateObj)) {
            const colIdx = headers.indexOf(colName);
            if (colIdx !== -1) {
              sheet.getRange(rowNum, colIdx + 1).setValue(val);
            }
          }
          return { success: true, row: rowNum, data: updateObj };
        }
      }
      throw new Error(`Record with ${keyColumn}='${keyValue}' not found in '${sheetName}'`);
    } finally {
      lock.releaseLock();
    }
  },

  // অডিট লগ সংরক্ষণ
  logAudit: function(userId, action, entity, entityId, oldValue, newValue, requestId) {
    this.insertRow("Audit_Logs", {
      log_id: "AUD-" + Utilities.getUuid().substring(0, 8),
      user_id: userId || "SYSTEM",
      action: action,
      entity: entity,
      entity_id: entityId,
      old_value: String(oldValue || ""),
      new_value: String(newValue || ""),
      reason: "Automated System Audit",
      timestamp: new Date().toISOString(),
      request_id: requestId || ""
    });
  }
};
