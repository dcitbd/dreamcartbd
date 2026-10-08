/**
 * DREAM CART BD — MASTER GOOGLE APPS SCRIPT API GATEWAY (Code.js)
 * Live Deployment: https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec
 * Connected Spreadsheet ID: 1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8
 * Reminders & Alerts: jainal.dcitbd@gmail.com
 */

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, httpMethod) {
  var action = "";
  var payload = {};

  if (e && e.parameter && e.parameter.action) {
    action = e.parameter.action;
    payload = e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      if (parsed.action) action = parsed.action;
      if (parsed.payload) payload = parsed.payload;
    } catch (err) {
      payload = e.parameter || {};
    }
  }

  if (!action) action = "system/health";

  var responseObj = dispatchAction(action, payload);
  var output = ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}

function dispatchAction(action, payload) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  switch (action) {
    case "system/health":
      return { status: "success", message: "Dream Cart BD Apps Script Gateway is Active!", time: new Date().toISOString() };

    case "products/list":
      return getSheetDataAsJson(ss, CONFIG.SHEETS.PRODUCTS);

    case "categories/list":
      return getSheetDataAsJson(ss, CONFIG.SHEETS.CATEGORIES);

    case "brands/list":
      return getSheetDataAsJson(ss, CONFIG.SHEETS.BRANDS);

    case "orders/list":
      return getSheetDataAsJson(ss, CONFIG.SHEETS.ORDERS);

    case "incomplete_orders/list":
      return getSheetDataAsJson(ss, CONFIG.SHEETS.INCOMPLETE_ORDERS);

    case "orders/create":
      return handleOrderCreation(ss, payload);

    case "incomplete_orders/create":
      return handleIncompleteOrder(ss, payload);

    case "viewers/log":
      return logViewerActivity(ss, payload);

    default:
      return { status: "success", message: "Action executed successfully: " + action };
  }
}

/**
 * Handle new order placement, append to Orders sheet, and send digital table reminder email to jainal.dcitbd@gmail.com
 */
function handleOrderCreation(ss, payload) {
  var sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.ORDERS);
    sheet.appendRow(CONFIG.SCHEMAS.ORDERS);
  }

  var orderId = payload.order_id || ("ORD-" + Math.floor(100000 + Math.random() * 900000));
  var dateStr = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

  var row = [
    dateStr,
    orderId,
    payload.account_type || "Customer",
    payload.customer_name || "গ্রাহক",
    payload.phone || "",
    payload.address || "",
    payload.products || (payload.items ? payload.items.map(function(i) { return i.name + " (" + i.quantity + ")"; }).join(", ") : "Product"),
    payload.color || "",
    payload.size || "",
    payload.quantity || 1,
    payload.total_amount || 0,
    payload.payment_method || "Cash On Delivery (COD)",
    payload.transaction_id || "N/A",
    payload.payment_status || "COD",
    payload.order_status || "Order Placed",
    payload.reseller_commission || 0,
    payload.commission_status || "Pending"
  ];

  sheet.appendRow(row);

  // Send HTML Table Reminder Email to jainal.dcitbd@gmail.com
  sendOrderReminderEmail(orderId, payload, dateStr);

  return {
    status: "success",
    success: true,
    data: { order_id: orderId },
    message: "Order placed and recorded successfully!"
  };
}

/**
 * Send wonderful digital HTML table reminder email
 */
function sendOrderReminderEmail(orderId, orderData, dateStr) {
  try {
    var recipient = CONFIG.SHOP.NOTIFICATION_EMAIL || "jainal.dcitbd@gmail.com";
    var subject = "🔔 [নতুন অর্ডার] " + orderId + " — " + (orderData.customer_name || "গ্রাহক") + " (৳" + (orderData.total_amount || 0) + ")";

    var htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; color: #ffffff; text-align: center;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 900;">Dream Cart BD</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Smart Digital Commerce Platform — নতুন অর্ডার নোটিফিকেশন</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <div style="border-bottom: 2px solid #ecfdf5; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
                অর্ডার নিশ্চিতকরণ
              </span>
              <h3 style="margin: 8px 0 0 0; font-size: 18px; color: #0f172a;">অর্ডার আইডি: <span style="color: #059669;">${orderId}</span></h3>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">তারিখ ও সময়: ${dateStr}</p>
            </div>

            <!-- Details Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569; width: 35%;">গ্রাহকের নাম:</td>
                <td style="padding: 10px; font-weight: bold; color: #0f172a;">${orderData.customer_name || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">মোবাইল নম্বর:</td>
                <td style="padding: 10px; color: #059669; font-weight: bold; font-family: monospace;">${orderData.phone || 'N/A'}</td>
              </tr>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">ডেলিভারি ঠিকানা:</td>
                <td style="padding: 10px; color: #334155;">${orderData.address || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">অ্যাকাউন্ট টাইপ:</td>
                <td style="padding: 10px; color: #334155;">${orderData.account_type || 'Customer'}</td>
              </tr>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">অর্ডারকৃত পণ্য:</td>
                <td style="padding: 10px; color: #0f172a; font-weight: bold;">${orderData.products || 'পণ্য'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #475569;">পেমেন্ট পদ্ধতি:</td>
                <td style="padding: 10px; color: #334155;">${orderData.payment_method || 'Cash On Delivery'} (${orderData.payment_status || 'COD'})</td>
              </tr>
              ${orderData.transaction_id && orderData.transaction_id !== 'N/A' ? `
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">TrxID:</td>
                  <td style="padding: 10px; font-family: monospace; color: #059669;">${orderData.transaction_id}</td>
                </tr>
              ` : ''}
              <tr style="background: #ecfdf5;">
                <td style="padding: 12px 10px; font-weight: bold; color: #065f46; font-size: 15px;">সর্বমোট প্রদেয়:</td>
                <td style="padding: 12px 10px; font-weight: 900; color: #059669; font-size: 16px;">৳${orderData.total_amount || 0}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://wa.me/88${orderData.phone}" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 12px; margin-right: 8px;">
                গ্রাহককে WhatsApp বার্তা পাঠান 💬
              </a>
              <a href="tel:${orderData.phone}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 12px;">
                সরাসরি কল করুন 📞
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            Dream Cart BD • চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা-৩৫০০।<br/>
            ডেভেলপার: জৈনাল আবেদীন (CEO, Dream Career IT BD)
          </div>

        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (e) {
    Logger.log("Failed to send order email: " + e.toString());
  }
}

/**
 * Handle incomplete order auto-tracking
 */
function handleIncompleteOrder(ss, payload) {
  var sheet = ss.getSheetByName(CONFIG.SHEETS.INCOMPLETE_ORDERS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.INCOMPLETE_ORDERS);
    sheet.appendRow(CONFIG.SCHEMAS.INCOMPLETE_ORDERS);
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
    payload.total_amount || 0,
    "Draft/Incomplete"
  ];
  sheet.appendRow(row);
  return { status: "success" };
}

/**
 * Log viewer analytics
 */
function logViewerActivity(ss, payload) {
  var sheet = ss.getSheetByName(CONFIG.SHEETS.VIEWERS);
  if (sheet) {
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
  }
  return { status: "success" };
}

/**
 * Helper to fetch any sheet data as JSON
 */
function getSheetDataAsJson(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "success", data: { items: [], total: 0 } };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: { items: [], total: 0 } };

  var headers = data[0];
  var items = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var key = String(headers[h]).toLowerCase().replace(/[^a-z0-9_]/g, "_");
      obj[key] = row[h];
    }
    items.push(obj);
  }

  return { status: "success", data: { items: items, total: items.length } };
}

/**
 * Initializer function to set up all 20 sheets with exact column schemas
 */
function setupAllSystemSheets() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheetConfigs = CONFIG.SCHEMAS;

  for (var key in sheetConfigs) {
    var sName = CONFIG.SHEETS[key];
    if (sName) {
      var sheet = ss.getSheetByName(sName);
      if (!sheet) {
        sheet = ss.insertSheet(sName);
        sheet.appendRow(sheetConfigs[key]);
      }
    }
  }
}
