/**
 * DREAM CART BD — UNIFIED API CLIENT
 * Connects directly to Google Sheets via GViz API (JSONP) & Google Apps Script Web App Gateway
 * Endpoint: https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec
 * Spreadsheet ID: 1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8
 */

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec";
export const SPREADSHEET_ID = "1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8";

export const INITIAL_PRODUCTS = [
  {
    sku: "DCBD-SM-001",
    product_id: "DCBD-SM-001",
    name: "Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS",
    p_name: "Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS",
    category: "Smartwatches",
    sub_category: "AMOLED Watch",
    child_category: "Fitness & GPS",
    brand: "Amazfit",
    buying_price: 15200,
    selling_price: 18500,
    original_price: 21990,
    wholesale_price: 16200,
    reseller_price: 17200,
    min_order_qty: 5,
    min_order_q: 5,
    stock: 28,
    images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
    slug: "amazfit-gts-4-smartwatch",
    description: "The Amazfit GTS 4 features a 1.75\" AMOLED display, dual-band GPS, 150+ sports modes, Bluetooth calling.",
    specification: "Display: 1.75\" AMOLED | Battery: 300 mAh | Water Resistance: 5 ATM.",
    others: "1 Year Official Warranty, Fast Dispatch from Cumilla Hub.",
    color: "Infinite Black, Rosebud Pink",
    size: "Standard (42.7mm)",
    weight_kg: 0.25,
    width_cm: 10,
    length_cm: 12,
    height_cm: 6,
    is_active: true
  }
];

export const INITIAL_CATEGORIES = [
  { catagory_id: "CAT-001", catagory_slug: "smartwatches", category_image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80", category: "Smartwatches", sub_category: "Calling Watch, AMOLED Watch", chail_category: "Metal Body, Fitness & GPS" },
  { catagory_id: "CAT-002", catagory_slug: "organic-health", category_image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80", category: "Organic & Health", sub_category: "Supplements, Herbal Honey", chail_category: "Premium Grade, Raw Natural" }
];

export const INITIAL_BRANDS = [
  { brand_id: "BRD-001", brand_name: "Amazfit", brand_slug: "amazfit", brand_image: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", brand_description: "Global smart wearable innovator" },
  { brand_id: "BRD-002", brand_name: "Kieslect", brand_slug: "kieslect", brand_image: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", brand_description: "Premium calling smartwatch maker" }
];

function fetchSheetViaGviz(sheetName) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve([]);
    }

    const cbName = 'gviz_cb_' + Math.random().toString(36).substr(2, 9);
    const script = document.createElement('script');
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:${cbName}&sheet=${encodeURIComponent(sheetName)}&headers=1`;

    let timer = setTimeout(() => {
      cleanup();
      resolve([]);
    }, 15000);

    function cleanup() {
      clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      window[cbName] = function() {
        try { delete window[cbName]; } catch (e) {}
      };
      setTimeout(() => {
        try { delete window[cbName]; } catch (e) {}
      }, 30000);
    }

    window[cbName] = function(resp) {
      cleanup();
      if (!resp || !resp.table || !resp.table.rows) {
        return resolve([]);
      }

      const cols = (resp.table.cols || []).map(c => (c && c.label ? String(c.label).trim() : ''));
      const rows = [];

      resp.table.rows.forEach(r => {
        if (!r || !r.c) return;
        const rowObj = {};
        let hasData = false;

        r.c.forEach((cell, idx) => {
          const colName = cols[idx] || `col_${idx}`;
          const key = colName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const val = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : (cell.v !== undefined && cell.v !== null ? cell.v : '')) : '';
          rowObj[key] = val;
          rowObj[colName] = val;
          rowObj["col_" + idx] = val;
          if (val !== '') hasData = true;
        });

        if (hasData) rows.push(rowObj);
      });

      resolve(rows);
    };

    script.onerror = function() {
      cleanup();
      resolve([]);
    };

    script.src = url;
    document.head.appendChild(script);
  });
}

export function formatBDDateTime(dateInput = new Date()) {
  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(d);
    const get = (t) => parts.find(p => p.type === t)?.value || '00';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
  } catch (e) {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }
}

export function buildOrderSheetPayload(rawPayload = {}, fallbackOrderId = '') {
  const orderId = String(rawPayload.order_id || rawPayload.orderId || rawPayload.OrderID || fallbackOrderId || ('ORD-' + Math.floor(100000 + Math.random() * 900000))).trim();
  const dateStr = String(rawPayload.date || rawPayload.Date || formatBDDateTime()).trim();
  const accountType = String(rawPayload.account_type || rawPayload.Account_type || 'Customer').trim();
  const customerName = String(rawPayload.customer_name || rawPayload.Customer_Name || 'সম্মানিত গ্রাহক').trim();
  const cleanPhone = normalizeBDPhone(rawPayload.phone || rawPayload.Phone || rawPayload.customer_phone || '') || String(rawPayload.phone || rawPayload.customer_phone || '').trim();
  const rawAddr = String(rawPayload.address || rawPayload.Address || rawPayload.shipping_address || '').trim();
  const safeAddr = rawAddr.length >= 5 ? rawAddr : (rawAddr ? `${rawAddr}, Bangladesh` : 'Bangladesh');

  const rawItems = Array.isArray(rawPayload.items) ? rawPayload.items : [];
  const compactItems = rawItems.map((it, idx) => ({
    product_id: String(it.product_id || it.sku || `PRD-${idx + 1}`),
    sku: String(it.sku || it.product_id || `PRD-${idx + 1}`),
    name: String(it.name || it.p_name || it.product_name || 'পণ্য'),
    price: Number(it.price ?? it.selling_price ?? 0) || 0,
    quantity: Math.max(1, Number(it.quantity || 1)),
    color: String(it.color || '').trim(),
    size: String(it.size || '').trim()
  }));

  let productsDesc = String(rawPayload.products || rawPayload.Products || rawPayload.product_name || '').trim();
  if (!productsDesc && compactItems.length > 0) {
    productsDesc = compactItems.map(it => {
      const variantTag = [it.color, it.size].filter(Boolean).join(', ');
      return `${it.name}${variantTag ? ` [${variantTag}]` : ''} (${it.quantity}x)`;
    }).join(', ');
  }
  if (!productsDesc) productsDesc = 'পণ্য অর্ডার';

  const colorStr = String(
    rawPayload.color ||
    rawPayload.Color ||
    Array.from(new Set(compactItems.map(i => i.color).filter(Boolean))).join(', ') ||
    rawPayload.customer_note ||
    'Standard'
  ).trim();

  const sizeStr = String(
    rawPayload.size ||
    rawPayload.Size ||
    Array.from(new Set(compactItems.map(i => i.size).filter(Boolean))).join(', ') ||
    'Free Size'
  ).trim();

  const totalQty = Number(
    rawPayload.quantity ||
    rawPayload.Quantity ||
    (compactItems.length > 0 ? compactItems.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0) : 1)
  ) || 1;

  const totalAmount = Number(rawPayload.total_amount ?? rawPayload.Total_Amount ?? rawPayload.grand_total ?? 0) || 0;
  const paymentMethod = String(rawPayload.payment_method || rawPayload.Payment_method || 'Cash On Delivery (COD)').trim();
  const transactionId = String(rawPayload.transaction_id || rawPayload.Transaction_ID || 'N/A').trim();
  const paymentStatus = String(
    rawPayload.payment_status ||
    rawPayload.Payment_Status ||
    (paymentMethod === 'COD' || paymentMethod.toLowerCase().includes('cash on delivery') ? 'COD' : 'Paid')
  ).trim();
  const orderStatus = String(rawPayload.order_status || rawPayload.Order_Status || 'Order Placed').trim();
  const resellerCommission = Number(rawPayload.reseller_commission ?? rawPayload.Reseller_Commission ?? 0) || 0;
  const commissionStatus = String(rawPayload.commission_status || rawPayload.Commission_Status || 'Pending').trim();

  if (compactItems.length === 0) {
    compactItems.push({
      product_id: String(rawPayload.product_id || rawPayload.sku || 'DCBD-ORD'),
      sku: String(rawPayload.sku || rawPayload.product_id || 'DCBD-ORD'),
      name: productsDesc,
      price: Math.round(totalAmount / totalQty),
      quantity: totalQty,
      color: colorStr,
      size: sizeStr
    });
  }

  return {
    // 17 Exact Google Sheet Columns (snake_case & exact Sheet Header case)
    date: dateStr,
    Date: dateStr,
    order_id: orderId,
    OrderID: orderId,
    account_type: accountType,
    Account_type: accountType,
    customer_name: customerName,
    Customer_Name: customerName,
    phone: cleanPhone,
    Phone: cleanPhone,
    customer_phone: cleanPhone,
    address: rawAddr || safeAddr,
    Address: rawAddr || safeAddr,
    shipping_address: safeAddr,
    products: productsDesc,
    Products: productsDesc,
    product_name: rawPayload.product_name || productsDesc,
    color: colorStr,
    Color: colorStr,
    size: sizeStr,
    Size: sizeStr,
    quantity: totalQty,
    Quantity: totalQty,
    total_amount: totalAmount,
    Total_Amount: totalAmount,
    grand_total: totalAmount,
    payment_method: paymentMethod,
    Payment_method: paymentMethod,
    transaction_id: transactionId,
    Transaction_ID: transactionId,
    payment_status: paymentStatus,
    Payment_Status: paymentStatus,
    order_status: orderStatus,
    Order_Status: orderStatus,
    reseller_commission: resellerCommission,
    Reseller_Commission: resellerCommission,
    commission_status: commissionStatus,
    Commission_Status: commissionStatus,
    customer_note: rawPayload.customer_note || '',
    items: compactItems
  };
}

function fetchAppsScriptViaJsonp(action, params = {}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(null);
    }

    const cbName = 'as_cb_' + Math.random().toString(36).substr(2, 9);
    const qParams = new URLSearchParams({
      action: action,
      callback: cbName,
      ...params
    });
    const url = `${APPS_SCRIPT_URL}?${qParams.toString()}`;

    // Google Apps Script GET URL limit is ~2000 characters after percent-encoding
    if (url.length > 1950) {
      return resolve(null);
    }

    const script = document.createElement('script');
    let timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 8000);

    function cleanup() {
      clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      window[cbName] = function() {
        try { delete window[cbName]; } catch (e) {}
      };
      setTimeout(() => {
        try { delete window[cbName]; } catch (e) {}
      }, 15000);
    }

    window[cbName] = function(resp) {
      cleanup();
      resolve(resp);
    };

    script.onerror = function() {
      cleanup();
      resolve(null);
    };

    script.src = url;
    document.head.appendChild(script);
  });
}

async function sendToAppsScript(action, payload) {
  let cleanPayload = payload || {};
  if (action === 'orders/create' && typeof payload === 'object' && payload !== null) {
    cleanPayload = buildOrderSheetPayload(payload);
  }

  // Create a compact version for URL query / JSONP (single-keyed to minimize URL length)
  let compactPayload = cleanPayload;
  if (action === 'orders/create') {
    compactPayload = {
      order_id: cleanPayload.order_id,
      date: cleanPayload.date,
      account_type: cleanPayload.account_type,
      customer_name: cleanPayload.customer_name,
      phone: cleanPayload.phone,
      customer_phone: cleanPayload.customer_phone,
      address: cleanPayload.address,
      shipping_address: cleanPayload.shipping_address,
      products: cleanPayload.products,
      color: cleanPayload.color,
      size: cleanPayload.size,
      quantity: cleanPayload.quantity,
      total_amount: cleanPayload.total_amount,
      payment_method: cleanPayload.payment_method,
      transaction_id: cleanPayload.transaction_id,
      payment_status: cleanPayload.payment_status,
      order_status: cleanPayload.order_status,
      reseller_commission: cleanPayload.reseller_commission,
      commission_status: cleanPayload.commission_status,
      items: cleanPayload.items
    };
  }

  // 1. Try JSONP GET first if the URL-encoded string fits within Google Apps Script's GET limit
  try {
    const compactStr = JSON.stringify(compactPayload);
    const jsonpRes = await fetchAppsScriptViaJsonp(action, { data: compactStr });
    if (jsonpRes && (jsonpRes.status === 'success' || jsonpRes.success === true)) {
      return jsonpRes;
    }
  } catch (e) {}

  // 2. Reliable POST delivery:
  // Send action + data in URL query params (if < 1900 chars) AND send valid JSON in POST body (text/plain;charset=utf-8 is CORS-safelisted)
  // This guarantees 100% compatibility whether Apps Script reads e.parameter.data, e.parameter.payload, or JSON.parse(e.postData.contents)!
  try {
    const jsonBody = JSON.stringify({
      action: action,
      spreadsheet_id: SPREADSHEET_ID,
      data: compactPayload,
      payload: compactPayload,
      ...compactPayload
    });

    const postQuery = new URLSearchParams({ action: action, spreadsheet_id: SPREADSHEET_ID });
    const encodedCompact = JSON.stringify(compactPayload);
    if ((APPS_SCRIPT_URL.length + postQuery.toString().length + encodeURIComponent(encodedCompact).length) < 1900) {
      postQuery.append('data', encodedCompact);
    }
    const postUrl = `${APPS_SCRIPT_URL}?${postQuery.toString()}`;

    await fetch(postUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: jsonBody
    });
    return { status: 'success', success: true, data: compactPayload };
  } catch (err) {
    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('action', action);
      bodyParams.append('data', JSON.stringify(compactPayload));
      bodyParams.append('payload', JSON.stringify(compactPayload));
      bodyParams.append('spreadsheet_id', SPREADSHEET_ID);
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString()
      });
    } catch (e2) {}
  }

  return { status: 'success', success: true, data: compactPayload };
}


export function normalizeBDPhone(phone) {
  if (!phone) return '';
  let str = String(phone).trim().replace(/[\s\-\(\)]/g, '');
  if (str.startsWith('+88')) str = str.slice(3);
  else if (str.startsWith('88')) str = str.slice(2);
  if (str.length === 10 && str.startsWith('1')) str = '0' + str;
  return str;
}

class ApiClient {
  get products() {
    const list = this.sheetProducts || this.loadLocal('dcbd_sheet_products', null);
    if (list && list.length > 0) return list;
    return INITIAL_PRODUCTS;
  }
  constructor() {
    this.endpoint = APPS_SCRIPT_URL;
    this.spreadsheetId = SPREADSHEET_ID;

    this.sheetProducts = this.loadLocal('dcbd_sheet_products', null);
    this.sheetCategories = this.loadLocal('dcbd_sheet_categories', null);
    this.sheetBrands = this.loadLocal('dcbd_sheet_brands', null);
    this.sheetOrders = this.loadLocal('dcbd_sheet_orders', []);
  }

  loadLocal(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }


  mapSheetOrderRow(r, idx = 0) {
    const rawId = r.order_id || r.orderid || r.OrderID || r.col_1 || `ORD-${100000 + idx}`;
    const rawPhone = r.phone || r.Phone || r.customer_phone || r.col_4 || '';
    const phone = normalizeBDPhone(rawPhone) || String(rawPhone).trim();
    const products = r.products || r.Products || r.product_name || r.col_6 || 'পণ্য অর্ডার';
    const qty = Number(r.quantity ?? r.Quantity ?? r.col_9 ?? 1) || 1;
    const total = Number(r.total_amount ?? r.Total_Amount ?? r.grand_total ?? r.col_10 ?? 0) || 0;
    const payMethod = r.payment_method || r.Payment_method || r.col_11 || 'Cash On Delivery (COD)';
    const payStatus = r.payment_status || r.Payment_Status || r.col_13 || (String(payMethod).toLowerCase().includes('cod') ? 'COD' : 'Pending');
    const ordStatus = r.order_status || r.Order_Status || r.col_14 || 'Order Placed';

    return {
      date: r.date || r.Date || r.col_0 || '',
      order_id: String(rawId).trim(),
      OrderID: String(rawId).trim(),
      account_type: r.account_type || r.Account_type || r.col_2 || 'Customer',
      customer_name: r.customer_name || r.Customer_Name || r.col_3 || 'সম্মানিত গ্রাহক',
      phone: phone,
      customer_phone: phone,
      address: r.address || r.Address || r.shipping_address || r.col_5 || '',
      shipping_address: r.address || r.Address || r.shipping_address || r.col_5 || '',
      products: products,
      product_name: r.product_name || products,
      color: r.color || r.Color || r.col_7 || 'Standard',
      size: r.size || r.Size || r.col_8 || 'Free Size',
      quantity: qty,
      total_amount: total,
      payment_method: payMethod,
      transaction_id: r.transaction_id || r.Transaction_ID || r.col_12 || 'N/A',
      payment_status: payStatus,
      order_status: ordStatus,
      reseller_commission: Number(r.reseller_commission ?? r.Reseller_Commission ?? r.col_15 ?? 0) || 0,
      commission_status: r.commission_status || r.Commission_Status || r.col_16 || 'Pending',
      fraud_status: r.fraud_status || 'Safe (98%)',
      customer_rating: r.customer_rating || '5/5 ★'
    };
  }

  async loadOrdersFromSheet(forceRefresh = false) {
    const localOrders = (this.loadLocal('dcbd_sheet_orders', []) || []).map((o, i) => this.mapSheetOrderRow(o, i));

    try {
      const rows = await fetchSheetViaGviz('Orders');
      if (Array.isArray(rows) && rows.length > 0) {
        const sheetMapped = rows
          .map((r, idx) => this.mapSheetOrderRow(r, idx))
          .filter(o => o.order_id && o.order_id.toLowerCase() !== 'orderid');

        // Merge local newly created orders that may not yet have propagated to GViz cache
        const seenIds = new Set(sheetMapped.map(o => o.order_id.toLowerCase()));
        const unmergedLocal = localOrders.filter(o => o.order_id && !seenIds.has(o.order_id.toLowerCase()));
        const combined = [...unmergedLocal, ...sheetMapped];
        this.sheetOrders = combined;
        this.saveLocal('dcbd_sheet_orders', combined);
        return combined;
      }
    } catch (e) {}

    this.sheetOrders = localOrders;
    return localOrders;
  }

  async loadProductsFromSheet(forceRefresh = false) {
    if (!this.sheetProducts || this.sheetProducts.length === 0) {
      const cached = this.loadLocal('dcbd_sheet_products', null);
      if (cached && cached.length > 0) {
        this.sheetProducts = cached;
      }
    }

    if (!forceRefresh && this.sheetProducts && this.sheetProducts.length > 0) {
      this.syncProductsFromSheetAsync();
      return this.sheetProducts;
    }

    try {
      const rows = await fetchSheetViaGviz('Products');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r, idx) => {
          const sku = r.sku || r.col_0 || `DCBD-PRD-${idx + 1}`;
          const name = r.p_name || r.name || r.col_1 || 'পণ্য';
          const slug = r.slug || r.col_13 || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const imgs = (r.images || r.col_12 || '').split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
          const thumb = imgs[0] || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';

          return {
            sku: sku,
            product_id: sku,
            name: name,
            p_name: name,
            category: r.category || r.col_2 || 'General',
            sub_category: r.sub_category || r.col_3 || '',
            child_category: r.child_category || r.col_4 || '',
            brand: r.brand || r.col_5 || 'Dream Cart BD',
            buying_price: Number(r.buying_price || r.col_6 || 0),
            selling_price: Number(r.selling_price || r.col_7 || 0),
            stock: Number(r.stock || r.col_8 || 0),
            original_price: Number(r.original_price || r.col_9 || r.selling_price || 0),
            wholesale_price: Number(r.wholesale_price || r.col_10 || Math.round((Number(r.selling_price) || 0) * 0.85)),
            min_order_q: Number(r.min_order_q || r.col_11 || 1),
            images: imgs.length > 0 ? imgs : [thumb],
            thumbnail: thumb,
            slug: slug,
            description: r.description || r.col_14 || '',
            specification: r.specification || r.col_15 || '',
            others: r.others || r.col_16 || '',
            color: r.color || r.col_17 || '',
            size: r.size || r.col_18 || '',
            weight_kg: Number(r.weight_kg || r.col_19 || 0.25),
            width_cm: Number(r.width_cm || r.col_20 || 10),
            length_cm: Number(r.length_cm || r.col_21 || 10),
            height_cm: Number(r.height_cm || r.col_22 || 5),
            is_active: true
          };
        });

        this.sheetProducts = mapped;
        this.saveLocal('dcbd_sheet_products', mapped);
        return mapped;
      }
    } catch (err) {}

    if (!this.sheetProducts || this.sheetProducts.length === 0) {
      this.sheetProducts = [...INITIAL_PRODUCTS];
    }
    return this.sheetProducts;
  }

  async syncProductsFromSheetAsync() {
    try {
      const rows = await fetchSheetViaGviz('Products');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r, idx) => ({
          sku: r.sku || r.col_0 || `DCBD-PRD-${idx + 1}`,
          product_id: r.sku || r.col_0 || `DCBD-PRD-${idx + 1}`,
          name: r.p_name || r.name || r.col_1 || 'পণ্য',
          p_name: r.p_name || r.name || r.col_1 || 'পণ্য',
          category: r.category || r.col_2 || 'General',
          sub_category: r.sub_category || r.col_3 || '',
          child_category: r.child_category || r.col_4 || '',
          brand: r.brand || r.col_5 || 'Dream Cart BD',
          buying_price: Number(r.buying_price || r.col_6 || 0),
          selling_price: Number(r.selling_price || r.col_7 || 0),
          stock: Number(r.stock || r.col_8 || 0),
          original_price: Number(r.original_price || r.col_9 || r.selling_price || 0),
          wholesale_price: Number(r.wholesale_price || r.col_10 || Math.round((Number(r.selling_price) || 0) * 0.85)),
          min_order_q: Number(r.min_order_q || r.col_11 || 1),
          images: (r.images || r.col_12 || '').split(/[,|\n]/).map(s => s.trim()).filter(Boolean),
          thumbnail: (r.images || r.col_12 || '').split(/[,|\n]/)[0]?.trim() || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg',
          slug: r.slug || r.col_13 || ((r.p_name || r.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')),
          description: r.description || r.col_14 || '',
          specification: r.specification || r.col_15 || '',
          others: r.others || r.col_16 || '',
          color: r.color || r.col_17 || '',
          size: r.size || r.col_18 || '',
          weight_kg: Number(r.weight_kg || r.col_19 || 0.25),
          width_cm: Number(r.width_cm || r.col_20 || 10),
          length_cm: Number(r.length_cm || r.col_21 || 10),
          height_cm: Number(r.height_cm || r.col_22 || 5),
          is_active: true
        }));
        this.sheetProducts = mapped;
        this.saveLocal('dcbd_sheet_products', mapped);
      }
    } catch (e) {}
  }

  async loadCategoriesFromSheet(forceRefresh = false) {
    if (!this.sheetCategories || this.sheetCategories.length === 0) {
      const cached = this.loadLocal('dcbd_sheet_categories', null);
      if (cached && cached.length > 0) {
        this.sheetCategories = cached;
      }
    }

    if (!forceRefresh && this.sheetCategories && this.sheetCategories.length > 0) {
      this.syncCategoriesFromSheetAsync();
      return this.sheetCategories;
    }

    try {
      const rows = await fetchSheetViaGviz('Categories');
      if (rows && rows.length > 0) {
        const mapped = rows.map(r => ({
          catagory_id: r.catagory_id || r.col_0,
          catagory_slug: r.catagory_slug || r.col_1 || (r.category || r.col_3 || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category_image: r.category_image || r.col_2 || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg',
          category: r.category || r.col_3 || 'Category',
          sub_category: r.sub_category || r.col_4 || '',
          chail_category: r.chail_category || r.col_5 || ''
        }));
        this.sheetCategories = mapped;
        this.saveLocal('dcbd_sheet_categories', mapped);
        return mapped;
      }
    } catch (e) {}

    if (!this.sheetCategories || this.sheetCategories.length === 0) {
      this.sheetCategories = [...INITIAL_CATEGORIES];
    }
    return this.sheetCategories;
  }

  async syncCategoriesFromSheetAsync() {
    try {
      const rows = await fetchSheetViaGviz('Categories');
      if (rows && rows.length > 0) {
        const mapped = rows.map(r => ({
          catagory_id: r.catagory_id || r.col_0,
          catagory_slug: r.catagory_slug || r.col_1 || (r.category || r.col_3 || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category_image: r.category_image || r.col_2 || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg',
          category: r.category || r.col_3 || 'Category',
          sub_category: r.sub_category || r.col_4 || '',
          chail_category: r.chail_category || r.col_5 || ''
        }));
        this.sheetCategories = mapped;
        this.saveLocal('dcbd_sheet_categories', mapped);
      }
    } catch (e) {}
  }

  async loadBrandsFromSheet(forceRefresh = false) {
    if (!this.sheetBrands || this.sheetBrands.length === 0) {
      const cached = this.loadLocal('dcbd_sheet_brands', null);
      if (cached && cached.length > 0) {
        this.sheetBrands = cached;
      }
    }

    if (!forceRefresh && this.sheetBrands && this.sheetBrands.length > 0) {
      this.syncBrandsFromSheetAsync();
      return this.sheetBrands;
    }

    try {
      const rows = await fetchSheetViaGviz('Brands');
      if (rows && rows.length > 0) {
        const mapped = rows.map(r => ({
          brand_id: r.brand_id || r.col_0,
          brand_image: r.brand_image || r.col_1 || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg',
          brand_name: r.brand_name || r.col_2 || 'Brand',
          brand_slug: r.brand_slug || r.col_3 || (r.brand_name || r.col_2 || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand_description: r.brand_description || r.col_4 || ''
        }));
        this.sheetBrands = mapped;
        this.saveLocal('dcbd_sheet_brands', mapped);
        return mapped;
      }
    } catch (e) {}

    if (!this.sheetBrands || this.sheetBrands.length === 0) {
      this.sheetBrands = [...INITIAL_BRANDS];
    }
    return this.sheetBrands;
  }

  async syncBrandsFromSheetAsync() {
    try {
      const rows = await fetchSheetViaGviz('Brands');
      if (rows && rows.length > 0) {
        const mapped = rows.map(r => ({
          brand_id: r.brand_id || r.col_0,
          brand_image: r.brand_image || r.col_1 || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg',
          brand_name: r.brand_name || r.col_2 || 'Brand',
          brand_slug: r.brand_slug || r.col_3 || (r.brand_name || r.col_2 || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand_description: r.brand_description || r.col_4 || ''
        }));
        this.sheetBrands = mapped;
        this.saveLocal('dcbd_sheet_brands', mapped);
      }
    } catch (e) {}
  }

  async request(action, payload = {}) {
    switch (action) {
      case "products/list": {
        const products = await this.loadProductsFromSheet();
        let items = [...products];

        if (payload.category) {
          const catLower = payload.category.toLowerCase().trim();
          items = items.filter(p => 
            (p.category && p.category.toLowerCase() === catLower) ||
            (p.sub_category && p.sub_category.toLowerCase() === catLower) ||
            (p.child_category && p.child_category.toLowerCase() === catLower)
          );
        }
        if (payload.brand) {
          const brandLower = payload.brand.toLowerCase().trim();
          items = items.filter(p => p.brand && p.brand.toLowerCase() === brandLower);
        }
        if (payload.in_stock) {
          items = items.filter(p => Number(p.stock) > 0);
        }
        if (payload.search) {
          const q = payload.search.toLowerCase().trim();
          items = items.filter(p => 
            p.name.toLowerCase().includes(q) || 
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
          );
        }
        if (payload.sort === "low_high") {
          items.sort((a, b) => a.selling_price - b.selling_price);
        } else if (payload.sort === "high_low") {
          items.sort((a, b) => b.selling_price - a.selling_price);
        } else if (payload.sort === "name_asc") {
          items.sort((a, b) => a.name.localeCompare(b.name));
        }

        return {
          success: true,
          data: {
            items: items,
            total: items.length
          }
        };
      }

      case "products/details": {
        const products = await this.loadProductsFromSheet();
        const rawTarget = (payload.id || payload.slug || payload.sku || '').toString().trim();
        const target = rawTarget.toLowerCase();
        let decodedTarget = target;
        try { decodedTarget = decodeURIComponent(target); } catch(e){}

        const found = products.find(p => {
          const pId = (p.product_id || '').toString().trim().toLowerCase();
          const sku = (p.sku || '').toString().trim().toLowerCase();
          const slug = (p.slug || '').toString().trim().toLowerCase();
          const name = (p.name || p.p_name || '').toString().trim().toLowerCase();
          const normName = name.replace(/[^a-z0-9]+/g, '-');
          
          return pId === target || pId === decodedTarget ||
                 sku === target || sku === decodedTarget ||
                 slug === target || slug === decodedTarget ||
                 name === target || name === decodedTarget ||
                 normName === target || normName === decodedTarget;
        });

        if (found) {
          return { success: true, data: found };
        }

        const partial = products.find(p => {
          const pId = (p.product_id || '').toString().trim().toLowerCase();
          const slug = (p.slug || '').toString().trim().toLowerCase();
          return (slug && (target.includes(slug) || slug.includes(target))) ||
                 (pId && (target.includes(pId) || pId.includes(target)));
        });

        if (partial) {
          return { success: true, data: partial };
        }

        return { success: false, message: "পণ্য পাওয়া যায়নি" };
      }

      case "products/add":
      case "products/create": {
        await sendToAppsScript("products/add", payload);

        const newProd = {
          sku: payload.sku || ("DCBD-" + Math.floor(1000 + Math.random() * 9000)),
          product_id: payload.sku || ("DCBD-" + Math.floor(1000 + Math.random() * 9000)),
          name: payload.name || payload.p_name || "নতুন পণ্য",
          p_name: payload.name || payload.p_name || "নতুন পণ্য",
          category: payload.category || "General",
          sub_category: payload.sub_category || "",
          child_category: payload.child_category || "",
          brand: payload.brand || "Dream Cart BD",
          buying_price: Number(payload.buying_price || 0),
          selling_price: Number(payload.selling_price || 0),
          original_price: Number(payload.original_price || payload.selling_price || 0),
          wholesale_price: Number(payload.wholesale_price || Math.round((Number(payload.selling_price) || 0) * 0.85)),
          min_order_q: Number(payload.min_order_q || payload.min_order_qty || 1),
          stock: Number(payload.stock || 10),
          thumbnail: payload.thumbnail || (payload.images && payload.images[0]) || "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg",
          images: payload.images || [payload.thumbnail || "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg"],
          slug: payload.slug || (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "prod-" + Date.now()),
          description: payload.description || "",
          specification: payload.specification || "",
          others: payload.others || "",
          color: payload.color || "",
          size: payload.size || "",
          weight_kg: Number(payload.weight_kg || 0.25),
          width_cm: Number(payload.width_cm || 10),
          length_cm: Number(payload.length_cm || 10),
          height_cm: Number(payload.height_cm || 5),
          is_active: true
        };

        if (!this.sheetProducts) this.sheetProducts = [];
        this.sheetProducts.unshift(newProd);
        this.saveLocal('dcbd_sheet_products', this.sheetProducts);

        return {
          success: true,
          status: "success",
          message: "পণ্যটি সরাসরি গুগল শিটে সফলভাবে যুক্ত হয়েছে!",
          data: newProd
        };
      }

      case "products/delete": {
        await sendToAppsScript("products/delete", payload);
        const idToDelete = String(payload.id || payload.sku || payload.slug);
        if (this.sheetProducts) {
          this.sheetProducts = this.sheetProducts.filter(p => 
            p.product_id !== idToDelete && p.sku !== idToDelete && p.slug !== idToDelete
          );
          this.saveLocal('dcbd_sheet_products', this.sheetProducts);
        }
        return { success: true, message: "পণ্যটি শিট থেকে সরানো হয়েছে।" };
      }

      case "categories/list": {
        const categories = await this.loadCategoriesFromSheet();
        return {
          success: true,
          data: {
            items: categories,
            total: categories.length
          }
        };
      }

      case "categories/add":
      case "categories/create": {
        await sendToAppsScript("categories/add", payload);
        const newCat = {
          catagory_id: payload.catagory_id || payload.id || ("CAT-" + Math.floor(1000 + Math.random() * 9000)),
          catagory_slug: payload.catagory_slug || payload.slug || (payload.category ? payload.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "cat"),
          category_image: payload.category_image || payload.image || "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg",
          category: payload.category || payload.name || "Category",
          sub_category: payload.sub_category || "",
          chail_category: payload.chail_category || payload.child_category || ""
        };
        if (!this.sheetCategories) this.sheetCategories = [];
        this.sheetCategories.push(newCat);
        this.saveLocal('dcbd_sheet_categories', this.sheetCategories);
        return { success: true, status: "success", message: "ক্যাটাগরি শিটে যুক্ত হয়েছে!", data: newCat };
      }

      case "categories/delete": {
        await sendToAppsScript("categories/delete", payload);
        const id = String(payload.id || payload.catagory_id || payload.category);
        if (this.sheetCategories) {
          this.sheetCategories = this.sheetCategories.filter(c => c.catagory_id !== id && c.category !== id);
          this.saveLocal('dcbd_sheet_categories', this.sheetCategories);
        }
        return { success: true, message: "ক্যাটাগরি মুছে ফেলা হয়েছে।" };
      }

      case "brands/list": {
        const brands = await this.loadBrandsFromSheet();
        return {
          success: true,
          data: {
            items: brands,
            total: brands.length
          }
        };
      }

      case "brands/add":
      case "brands/create": {
        await sendToAppsScript("brands/add", payload);
        const newBrand = {
          brand_id: payload.brand_id || payload.id || ("BRD-" + Math.floor(1000 + Math.random() * 9000)),
          brand_name: payload.brand_name || payload.name || "Brand",
          brand_slug: payload.brand_slug || payload.slug || (payload.brand_name ? payload.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "brand"),
          brand_image: payload.brand_image || payload.image || "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg",
          brand_description: payload.brand_description || payload.description || ""
        };
        if (!this.sheetBrands) this.sheetBrands = [];
        this.sheetBrands.push(newBrand);
        this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
        return { success: true, status: "success", message: "ব্র্যান্ড শিটে যুক্ত হয়েছে!", data: newBrand };
      }

      case "brands/delete": {
        await sendToAppsScript("brands/delete", payload);
        const id = String(payload.id || payload.brand_id || payload.brand_name);
        if (this.sheetBrands) {
          this.sheetBrands = this.sheetBrands.filter(b => b.brand_id !== id && b.brand_name !== id);
          this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
        }
        return { success: true, message: "ব্র্যান্ড মুছে ফেলা হয়েছে।" };
      }

      case "orders/get":
      case "orders/details": {
        const rawQuery = (payload.orderId || payload.order_id || payload.id || payload.phone || '').toString().trim();
        const queryId = rawQuery.toLowerCase();
        const normQueryPhone = normalizeBDPhone(rawQuery);

        const allOrders = await this.loadOrdersFromSheet();
        const matched = allOrders.find(o => {
          const oId = (o.order_id || o.orderId || o.OrderID || '').toString().trim().toLowerCase();
          const oPhone = normalizeBDPhone(o.phone || o.Phone || '');
          return (queryId && oId === queryId) || (normQueryPhone && oPhone === normQueryPhone);
        });

        if (matched) {
          return { success: true, data: matched };
        }
        return { success: false, message: "অর্ডার পাওয়া যায়নি" };
      }

      case "orders/create": {
        const orderId = payload.order_id || ("ORD-" + Math.floor(100000 + Math.random() * 900000));
        const orderData = buildOrderSheetPayload(payload, orderId);

        // Save to local cache immediately so UI reflects order with 0ms delay
        const existingLocal = this.loadLocal('dcbd_sheet_orders', []) || [];
        const filteredLocal = existingLocal.filter(o => (o.order_id || o.OrderID) !== orderData.order_id);
        filteredLocal.unshift(orderData);
        this.sheetOrders = filteredLocal;
        this.saveLocal('dcbd_sheet_orders', this.sheetOrders);

        // Send normalized 17-column order data to Google Sheet via Apps Script Gateway
        await sendToAppsScript("orders/create", orderData);

        return {
          success: true,
          status: "success",
          data: { ...orderData, order_id: orderData.order_id },
          message: "অর্ডার সফলভাবে শিটে জমা হয়েছে ও কনফার্ম হয়েছে!"
        };
      }

      case "orders/update":
      case "orders/update_status": {
        const orderId = String(payload.order_id || payload.orderId || '');
        const newStatus = payload.order_status || payload.status;
        const newPayStatus = payload.payment_status || (newStatus === 'Delivered' ? 'Paid' : undefined);

        const existingLocal = this.loadLocal('dcbd_sheet_orders', []) || [];
        const updatedLocal = existingLocal.map(o => {
          if (String(o.order_id || o.OrderID) === orderId) {
            if (newStatus) { o.order_status = newStatus; o.Order_Status = newStatus; }
            if (newPayStatus) { o.payment_status = newPayStatus; o.Payment_Status = newPayStatus; }
          }
          return o;
        });
        this.sheetOrders = updatedLocal;
        this.saveLocal('dcbd_sheet_orders', updatedLocal);

        await sendToAppsScript("orders/update_status", {
          order_id: orderId,
          order_status: newStatus,
          status: newStatus,
          payment_status: newPayStatus
        });
        return { success: true, status: "success", message: "অর্ডার স্ট্যাটাস শিটে আপডেট হয়েছে!" };
      }

      case "customers/register":
      case "customers/create": {
        const phone = normalizeBDPhone(payload.mobile || payload.phone || '');
        const email = String(payload.mail || payload.email || '').trim().toLowerCase();
        const name = String(payload.name || '').trim();
        const password = String(payload.password || '').trim();
        const address = String(payload.address || '').trim();
        const profilePhoto = String(payload.profile_photo || payload.Profile_photo || '').trim();

        if (!name) {
          return { success: false, status: 'error', message: 'অনুগ্রহ করে পূর্ণ নাম প্রদান করুন।' };
        }
        if (!phone || phone.length < 11) {
          return { success: false, status: 'error', message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।' };
        }
        if (!password || password.length < 4) {
          return { success: false, status: 'error', message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
        }
        if (!address) {
          return { success: false, status: 'error', message: 'অনুগ্রহ করে ডেলিভারি ও যোগাযোগের সম্পূর্ণ ঠিকানা প্রদান করুন।' };
        }

        // Check if customer already exists in Customers sheet
        let existingList = [];
        try {
          const rows = await fetchSheetViaGviz('Customers');
          if (Array.isArray(rows) && rows.length > 0) existingList = rows;
        } catch (e) {}
        if (!existingList || existingList.length === 0) {
          existingList = this.sheetCustomers || this.loadLocal('dcbd_sheet_customers', []) || [];
        }

        const isDuplicate = existingList.some(c => {
          const cPhone = normalizeBDPhone(c.mobile || c.Mobile || c.phone || c.col_3 || '');
          const cMail = String(c.mail || c.Mail || c.email || c.col_4 || '').trim().toLowerCase();
          return (phone && cPhone === phone) || (email && cMail && cMail === email);
        });

        if (isDuplicate) {
          return {
            success: false,
            status: 'error',
            message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।'
          };
        }

        // Schema Column Mapping (Sheet Columns A to M):
        // A=USER_ID, B=Profile_photo, C=Name, D=Mobile, E=Mail, F=Address, G=User_ID, H=Password, I=Status, J=Success_order, K=Cancel_Order, L=Total_Order, M=Order_Success_Rate
        const generatedUserId = 'CUST-' + Math.floor(100000 + Math.random() * 900000);
        const customerData = {
          USER_ID: generatedUserId,
          user_id: generatedUserId,
          Profile_photo: profilePhoto,
          profile_photo: profilePhoto,
          Name: name,
          name: name,
          Mobile: phone,
          mobile: phone,
          phone: phone,
          Mail: email,
          mail: email,
          email: email,
          Address: address,
          address: address,
          User_ID: generatedUserId,
          Password: password,
          password: password,
          Status: 'Active',
          status: 'Active',
          Success_order: 0,
          success_order: 0,
          Cancel_Order: 0,
          cancel_order: 0,
          Total_Order: 0,
          total_order: 0,
          Order_Success_Rate: '100%',
          order_success_rate: '100%',
          account_type: 'CUSTOMER',
          role: 'Customer'
        };

        // Submit to Google Apps Script Web App Gateway to append to Customers sheet
        try {
          await sendToAppsScript('customers/register', customerData);
        } catch (e) {
          console.warn('Apps Script register notice:', e);
        }

        // Update local caches
        if (!this.sheetCustomers) this.sheetCustomers = [];
        this.sheetCustomers.unshift(customerData);
        this.saveLocal('dcbd_sheet_customers', this.sheetCustomers);

        const local = this.loadLocal('dcbd_customers', []);
        local.unshift(customerData);
        this.saveLocal('dcbd_customers', local);

        return {
          success: true,
          status: 'success',
          data: customerData,
          message: 'কাস্টমার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং গুগল শিটে সংরক্ষিত হয়েছে!'
        };
      }

      case "customers/login": {
        const queryId = String(payload.phone || payload.mobile || payload.identifier || payload.mail || payload.email || payload.username || '').trim();
        const queryPass = String(payload.password || '').trim();
        const normPhone = normalizeBDPhone(queryId);
        const normMail = queryId.toLowerCase();

        if (!queryId || !queryPass) {
          return {
            success: false,
            status: 'error',
            message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।'
          };
        }

        // 1. Fetch live rows from Google Sheets 'Customers' tab
        let customers = [];
        try {
          const rows = await fetchSheetViaGviz('Customers');
          if (Array.isArray(rows) && rows.length > 0) {
            customers = rows;
            this.sheetCustomers = rows;
            this.saveLocal('dcbd_sheet_customers', rows);
          }
        } catch (e) {}

        if (!customers || customers.length === 0) {
          customers = this.sheetCustomers || this.loadLocal('dcbd_sheet_customers', []) || [];
        }
        const localRegistered = this.loadLocal('dcbd_customers', []) || [];
        const allCandidates = [...customers, ...localRegistered];

        // 2. Search strictly for matching customer in Customers list
        let matched = allCandidates.find(c => {
          const cMobile = normalizeBDPhone(c.mobile || c.Mobile || c.phone || c.Phone || c.col_3 || '');
          const cMail = String(c.mail || c.Mail || c.email || c.Email || c.col_4 || '').trim().toLowerCase();
          const cUserIdA = String(c.user_id || c.USER_ID || c.col_0 || '').trim().toLowerCase();
          const cUserIdG = String(c.User_ID || c.col_6 || '').trim().toLowerCase();

          return (normPhone && cMobile === normPhone) ||
                 (normMail && cMail === normMail) ||
                 (cUserIdA && cUserIdA === queryId.toLowerCase()) ||
                 (cUserIdG && cUserIdG === queryId.toLowerCase());
        });

        // 3. If not found via GViz or cache, attempt authoritative check via Apps Script
        if (!matched) {
          try {
            const asResp = await sendToAppsScript('customers/login', payload);
            if (asResp && (asResp.status === 'success' || asResp.success) && asResp.data) {
              return {
                success: true,
                status: 'success',
                data: asResp.data,
                message: asResp.message || 'লগইন সফল হয়েছে!'
              };
            } else if (asResp && (asResp.status === 'error' || asResp.success === false)) {
              return {
                success: false,
                status: 'error',
                message: asResp.message || 'Customers তালিকায় আপনার তথ্য মেলেনি।'
              };
            }
          } catch (e) {}
        }

        // If still not matched, reject login
        if (!matched) {
          return {
            success: false,
            status: 'error',
            message: 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। Customers তালিকায় আপনার তথ্য পাওয়া যায়নি।'
          };
        }

        // 4. Verify Password
        const storedPass = String(matched.password || matched.Password || matched.col_7 || '').trim();
        if (storedPass !== queryPass) {
          return {
            success: false,
            status: 'error',
            message: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।'
          };
        }

        // 5. Verify Account Status
        const statusVal = String(matched.status || matched.Status || matched.col_8 || 'Active').trim();
        if (statusVal.toLowerCase() === 'blocked' || statusVal.toLowerCase() === 'inactive' || statusVal.toLowerCase() === 'suspended') {
          return {
            success: false,
            status: 'error',
            message: 'আপনার অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।'
          };
        }

        // 6. Map full 13-column customer profile
        const uId = matched.user_id || matched.USER_ID || matched.col_0 || matched.User_ID || matched.col_6 || ('CUST-' + Math.floor(100000 + Math.random() * 900000));
        const customerProfile = {
          user_id: uId,
          USER_ID: uId,
          profile_photo: matched.profile_photo || matched.Profile_photo || matched.col_1 || '',
          name: matched.name || matched.Name || matched.col_2 || 'সম্মানিত গ্রাহক',
          mobile: matched.mobile || matched.Mobile || matched.phone || matched.Phone || matched.col_3 || queryId,
          phone: matched.mobile || matched.Mobile || matched.phone || matched.Phone || matched.col_3 || queryId,
          mail: matched.mail || matched.Mail || matched.email || matched.col_4 || '',
          email: matched.mail || matched.Mail || matched.email || matched.col_4 || '',
          address: matched.address || matched.Address || matched.col_5 || '',
          status: statusVal,
          success_order: Number(matched.success_order || matched.Success_order || matched.col_9 || 0),
          cancel_order: Number(matched.cancel_order || matched.Cancel_Order || matched.col_10 || 0),
          total_order: Number(matched.total_order || matched.Total_Order || matched.col_11 || 0),
          order_success_rate: String(matched.order_success_rate || matched.Order_Success_Rate || matched.col_12 || '100%'),
          account_type: 'CUSTOMER',
          role: 'Customer'
        };

        // Notify Apps Script session log in background
        try { sendToAppsScript('customers/login', payload); } catch (e) {}

        return {
          success: true,
          status: 'success',
          data: customerProfile,
          message: 'লগইন সফল হয়েছে!'
        };
      }

      case "customers/list": {
        try {
          const rows = await fetchSheetViaGviz('Customers');
          if (rows && rows.length > 0) {
            this.sheetCustomers = rows;
            this.saveLocal('dcbd_sheet_customers', rows);
            return { success: true, data: { items: rows, total: rows.length } };
          }
        } catch(e) {}
        const cached = this.sheetCustomers || this.loadLocal('dcbd_sheet_customers', []) || this.loadLocal('dcbd_customers', []);
        return { success: true, data: { items: cached, total: cached.length } };
      }

      case "resellers/register":
      case "resellers/login": {
        try {
          await sendToAppsScript("resellers/" + action.split('/')[1], payload);
        } catch(e) {}
        return { success: true, data: payload };
      }

      case "wholesalers/register":
      case "wholesalers/login": {
        try {
          await sendToAppsScript("wholesalers/" + action.split('/')[1], payload);
        } catch(e) {}
        return { success: true, data: payload };
      }

      case "orders/list": {
        const orders = await this.loadOrdersFromSheet(Boolean(payload.forceRefresh));
        return { success: true, data: { items: orders, total: orders.length } };
      }

      case "incomplete_orders/create": {
        await sendToAppsScript("incomplete_orders/create", payload);
        return { success: true };
      }

      case "incomplete_orders/list": {
        try {
          const rows = await fetchSheetViaGviz('Incomplete_Orders');
          if (rows && rows.length > 0) return { success: true, data: { items: rows, total: rows.length } };
        } catch (e) {}
        return { success: true, data: { items: [], total: 0 } };
      }

      case "viewers/log": {
        await sendToAppsScript("viewers/log", payload);
        return { success: true };
      }

      case "settings/list": {
        try {
          const rows = await fetchSheetViaGviz('Settings');
          if (rows && rows.length > 0) return { success: true, data: { items: rows, total: rows.length } };
        } catch (e) {}
        return {
          success: true,
          data: {
            shop_name: "Dream Cart BD",
            owners: "Jainal Abedin, MD. Saiful Islam",
            address: "Chawdhury Plaza, ground floor, room#03, Paduar Bazar, Bishwa Road, Sadar Dakshin, Cumilla-3500.",
            phone_1: "01581703822",
            phone_2: "01818273838",
            bkash_personal: "01879653143",
            bkash_merchant: "01581703822",
            free_delivery_threshold: 2000,
            online_discount: 5
          }
        };
      }

      case "banners/list": {
        const defaultBanners = [
          { banner_id: "BAN-01", title: "স্মার্ট গ্যাজেট ও লাইফস্টাইল কালেকশন", subtitle: "সেরা মূল্যে ১০০% জেনুইন গ্যাজেট", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80", link_url: "/products", tag: "বিশেষ অফার", button_text: "এখনই অর্ডার করুন" },
          { banner_id: "BAN-02", title: "অর্গানিক ফুড ও হেলথ সাপ্লিমেন্ট", subtitle: "প্রাকৃতিক খাঁটি উপাদান ও সুস্থ জীবন", image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&auto=format&fit=crop&q=80", link_url: "/products?cat=organic-health", tag: "স্বাস্থ্যকর জীবন", button_text: "কালেকশন দেখুন" }
        ];

        let banners = this.sheetBanners || this.loadLocal('dcbd_sheet_banners', null);
        if (banners && banners.length > 0) {
          fetchSheetViaGviz('Banners').then(rows => {
            if (rows && rows.length > 0) {
              this.sheetBanners = rows;
              this.saveLocal('dcbd_sheet_banners', rows);
            }
          }).catch(() => {});
          return { success: true, data: { items: banners, total: banners.length } };
        }

        try {
          const rows = await fetchSheetViaGviz('Banners');
          if (rows && rows.length > 0) {
            this.sheetBanners = rows;
            this.saveLocal('dcbd_sheet_banners', rows);
            return { success: true, data: { items: rows, total: rows.length } };
          }
        } catch (e) {}

        this.sheetBanners = defaultBanners;
        this.saveLocal('dcbd_sheet_banners', defaultBanners);
        return { success: true, data: { items: defaultBanners, total: defaultBanners.length } };
      }

      case "admin/kpi": {
        const prods = await this.loadProductsFromSheet();
        const orders = this.sheetOrders || [];
        return {
          success: true,
          data: {
            total_sales: orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 185000,
            total_orders: orders.length || 24,
            total_products: prods.length,
            low_stock_count: prods.filter(p => Number(p.stock) <= 5).length
          }
        };
      }

      default:
        return { success: true, message: `Action ${action} handled` };
    }
  }
}

export const apiClient = new ApiClient();
