/**
 * DREAM CART BD — MAIN APPS SCRIPT WEB APP ENTRYPOINT
 * Handles HTTP GET / POST, CORS Pre-flight, and JSON outputs.
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
  var sessionToken = "";
  var metadata = {
    method: httpMethod,
    ip: (e && e.contextPath) || "ClientIP",
    userAgent: ""
  };

  if (e && e.parameter) {
    action = e.parameter.action || "";
    sessionToken = e.parameter.token || "";
  }

  if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      if (parsed.action) action = parsed.action;
      if (parsed.payload) payload = parsed.payload;
      if (parsed.token) sessionToken = parsed.token;
      if (parsed.metadata) metadata = parsed.metadata;
    } catch (err) {
      // Fallback if form data
      payload = e.parameter || {};
    }
  } else if (e && e.parameter && !payload.items) {
    // If GET query parameters
    payload = e.parameter;
  }

  if (!action) {
    action = "system/health";
  }

  var responseObj = Router.dispatch(action, payload, sessionToken, metadata);
  var jsonOutput = JSON.stringify(responseObj);

  return ContentService.createTextOutput(jsonOutput)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup / Initializer function to create all required sheets and headers if not yet present.
 */
function setupSystemSheets() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheetsToCreate = [
    CONFIG.SHEETS.USERS,
    CONFIG.SHEETS.SESSIONS,
    CONFIG.SHEETS.CATEGORIES,
    CONFIG.SHEETS.PRODUCTS,
    CONFIG.SHEETS.VARIANTS,
    CONFIG.SHEETS.IMAGES,
    CONFIG.SHEETS.PRODUCT_OFFERS,
    CONFIG.SHEETS.SELLER_STORES,
    CONFIG.SHEETS.SELLER_APPLICATIONS,
    CONFIG.SHEETS.ORDERS,
    CONFIG.SHEETS.ORDER_ITEMS,
    CONFIG.SHEETS.SUB_ORDERS,
    CONFIG.SHEETS.ORDER_NOTES,
    CONFIG.SHEETS.STOCK_RESERVATIONS,
    CONFIG.SHEETS.COUPONS,
    CONFIG.SHEETS.COUPON_USAGE,
    CONFIG.SHEETS.ACTIVITY_LOGS,
    CONFIG.SHEETS.API_LOGS,
    CONFIG.SHEETS.NOTIFICATIONS_QUEUE,
    CONFIG.SHEETS.BACKGROUND_JOBS,
    CONFIG.SHEETS.PAYMENTS
  ];

  sheetsToCreate.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      ss.insertSheet(name);
    }
  });

  return "All required sheets verified and initialized.";
}
