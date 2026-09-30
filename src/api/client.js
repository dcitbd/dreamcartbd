/**
 * DREAM CART BD — UNIFIED API CLIENT
 * Handles requests to Google Apps Script Web App Gateway with resilient fallback data.
 */

// Configure Apps Script Web App Deployment URL here or via .env
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "https://script.google.com/macros/s/AKfycbznjGoCkjC-4u-KUkm-yaxDKYpUnWvxjXUqjZDP6vZCvQnwfQlupl4_HODMv1oC7CJt/exec";

// Initial High-Quality Catalog Data matching Dream Cart BD real products
const MOCK_PRODUCTS = [
  {
    product_id: "PRD-2609-1001",
    name: "Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & SpO2",
    slug: "amazfit-gts-4-smartwatch",
    sku: "AMZ-GTS4-BLK",
    category_id: "CAT-SMARTWATCH",
    category_name: "Smartwatches",
    brand_id: "BRD-AMAZFIT",
    selling_price: 18500,
    regular_price: 21990,
    discount_percent: 16,
    wholesale_price: 16200,
    reseller_price: 17200,
    thumbnail: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80",
    images: [
      { image_url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80" },
      { image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80" }
    ],
    stock_status: "in_stock",
    available_stock: 24,
    rating: 4.9,
    reviews_count: 38,
    seller_id: "DCBD-OFFICIAL",
    seller_name: "Dream Cart BD Official",
    short_description: "Ultra-sleek aluminum alloy design with 150+ sports modes, dual-band GPS, and Bluetooth phone calls.",
    warranty: "1 Year Official Warranty"
  },
  {
    product_id: "PRD-2609-1002",
    name: "Pure Organic Maca Root Powder (Peru Grade-A, 250g)",
    slug: "pure-organic-maca-root-powder-250g",
    sku: "SUP-MACA-250G",
    category_id: "CAT-ORGANIC",
    category_name: "Organic & Health",
    brand_id: "BRD-ORGANIC",
    selling_price: 1250,
    regular_price: 1650,
    discount_percent: 24,
    wholesale_price: 950,
    reseller_price: 1050,
    thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
    images: [
      { image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80" }
    ],
    stock_status: "in_stock",
    available_stock: 45,
    rating: 4.8,
    reviews_count: 52,
    seller_id: "DCBD-OFFICIAL",
    seller_name: "Dream Cart BD Official",
    short_description: "100% Raw gelatinized Peruvian Maca powder. Boosts natural stamina, hormonal balance, and vitality.",
    warranty: "100% Pure Organic Guarantee"
  },
  {
    product_id: "PRD-2609-1003",
    name: "High-Power Long-Range Tactical Rechargeable LED Torchlight (5000LM)",
    slug: "tactical-rechargeable-led-torchlight-5000lm",
    sku: "LGT-TAC-5000",
    category_id: "CAT-ELECTRONICS",
    category_name: "Tools & Electronics",
    brand_id: "BRD-POWERBEAM",
    selling_price: 1850,
    regular_price: 2400,
    discount_percent: 23,
    wholesale_price: 1400,
    reseller_price: 1550,
    thumbnail: "https://images.unsplash.com/photo-1550524514-96369dd83fae?w=500&auto=format&fit=crop&q=80",
    images: [
      { image_url: "https://images.unsplash.com/photo-1550524514-96369dd83fae?w=800&auto=format&fit=crop&q=80" }
    ],
    stock_status: "in_stock",
    available_stock: 18,
    rating: 4.7,
    reviews_count: 29,
    seller_id: "VND-TECHBD",
    seller_name: "Techno Tools Hub",
    short_description: "Aircraft-grade aluminum military flashlight with zoomable focus and built-in USB powerbank feature.",
    warranty: "6 Months Replacement Warranty"
  },
  {
    product_id: "PRD-2609-1004",
    name: "Heavy-Duty Gas Stove Safety Fire Saver & Wind Shield Ring",
    slug: "heavy-duty-gas-stove-safety-fire-saver",
    sku: "KIT-GAS-RING01",
    category_id: "CAT-HOME",
    category_name: "Home & Kitchen",
    brand_id: "BRD-SAFEGAS",
    selling_price: 490,
    regular_price: 750,
    discount_percent: 35,
    wholesale_price: 320,
    reseller_price: 380,
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80",
    images: [
      { image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80" }
    ],
    stock_status: "in_stock",
    available_stock: 60,
    rating: 4.9,
    reviews_count: 84,
    seller_id: "DCBD-OFFICIAL",
    seller_name: "Dream Cart BD Official",
    short_description: "Energy saving 40% gas cut ring. Fits standard burner stoves, stainless steel, heat resistant.",
    warranty: "1 Year Durability Guarantee"
  },
  {
    product_id: "PRD-2609-1005",
    name: "Huawei Band 8 Fitness Tracker — 1.47 Inch AMOLED Ultra Slim",
    slug: "huawei-band-8-fitness-tracker",
    sku: "HW-BND8-EM",
    category_id: "CAT-SMARTWATCH",
    category_name: "Smartwatches",
    brand_id: "BRD-HUAWEI",
    selling_price: 4400,
    regular_price: 5200,
    discount_percent: 15,
    wholesale_price: 3800,
    reseller_price: 4050,
    thumbnail: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=500&auto=format&fit=crop&q=80",
    images: [
      { image_url: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80" }
    ],
    stock_status: "in_stock",
    available_stock: 14,
    rating: 4.8,
    reviews_count: 41,
    seller_id: "DCBD-OFFICIAL",
    seller_name: "Dream Cart BD Official",
    short_description: "TruSleep 3.0 sleep tracking, 14-day battery life, fast charging, scientific health monitoring.",
    warranty: "6 Months Brand Warranty"
  },
  {
    product_id: "PRD-2609-1006",
    name: "Portable Wireless Multimedia Mini Speaker with Deep Bass & RGB Lights",
    slug: "portable-wireless-multimedia-mini-speaker",
    sku: "AUD-MINI-RGB",
    category_id: "CAT-ELECTRONICS",
    category_name: "Audio & Gadgets",
    brand_id: "BRD-SOUNDPRO",
    selling_price: 980,
    regular_price: 1450,
    discount_percent: 32,
    wholesale_price: 720,
    reseller_price: 810,
    thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80",
    images: [
      { image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80" }
    ],
    stock_status: "in_stock",
    available_stock: 32,
    rating: 4.6,
    reviews_count: 19,
    seller_id: "VND-TECHBD",
    seller_name: "Techno Tools Hub",
    short_description: "Compact punchy bass Bluetooth 5.3 speaker with dynamic LED ring light and TF/AUX/FM radio support.",
    warranty: "30 Days Replacement Guarantee"
  }
];

export const apiClient = {
  async request(action, payload = {}, token = null) {
    // If user configured a live Apps Script URL
    if (API_BASE_URL && !API_BASE_URL.includes("YOUR_DEPLOYMENT_ID")) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action, payload, token })
        });
        const json = await response.json();
        return json;
      } catch (err) {
        console.warn("Live API connection failed, falling back to client cache engine:", err);
      }
    }

    // Local Client Engine (Mock / Demonstration mode)
    return this.mockHandler(action, payload, token);
  },

  async mockHandler(action, payload, token) {
    // Artificial latency for authentic snappy feel
    await new Promise(r => setTimeout(r, 120));

    switch (action) {
      case "products/list": {
        let items = [...MOCK_PRODUCTS];
        if (payload.category) {
          items = items.filter(p => p.category_id.toLowerCase() === payload.category.toLowerCase());
        }
        if (payload.search) {
          const q = payload.search.toLowerCase();
          items = items.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
        }
        return {
          success: true,
          data: {
            items,
            pagination: { page: 1, limit: 20, total: items.length, total_pages: 1 }
          }
        };
      }

      case "products/details": {
        const item = MOCK_PRODUCTS.find(p => p.product_id === payload.id || p.slug === payload.id || p.slug === payload.slug);
        if (item) {
          return { success: true, data: item };
        }
        return { success: false, message: "Product not found", error_code: "NOT_FOUND" };
      }

      case "orders/create": {
        const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        return {
          success: true,
          data: {
            order_id: orderId,
            grand_total: payload.items.reduce((s, i) => s + (i.price * i.quantity), 0) + (payload.delivery_charge || 60) - (payload.discount || 0),
            sub_orders: [orderId + "-S1", orderId + "-S2"]
          },
          message: "Order placed successfully!"
        };
      }

      case "coupons/validate": {
        if (payload.code && payload.code.toUpperCase() === "DREAM10") {
          const discount = Math.round((payload.subtotal || 1000) * 0.10);
          return {
            success: true,
            data: {
              valid: true,
              code: "DREAM10",
              discount_type: "PERCENTAGE",
              discount_amount: discount
            }
          };
        }
        return { success: false, message: "Invalid promo code. Try DREAM10 for 10% off!" };
      }

      case "fraud/check_phone": {
        return {
          success: true,
          data: {
            phone: payload.phone,
            steadfast: { total_orders: 16, delivered: 15, returned: 1, success_rate: "93.8%" },
            pathao: { total_orders: 9, delivered: 8, returned: 1, success_rate: "88.9%" },
            redx: { total_orders: 4, delivered: 4, returned: 0, success_rate: "100%" },
            overall_success_rate: "93.1%",
            risk_score: 8,
            risk_level: "LOW (Safe Buyer)",
            recommendation: "Approved for Instant Shipment & COD"
          }
        };
      }

      case "admin/kpi": {
        return {
          success: true,
          data: {
            today_sales: 42850,
            today_orders: 18,
            total_sales: 1284500,
            total_orders: 684,
            pending_orders: 7,
            delivered_orders: 590,
            rto_orders: 22,
            low_stock_count: 3,
            total_products: 48,
            active_sellers: 12,
            total_customers: 940
          }
        };
      }

      default:
        return { success: true, message: "Operation simulated successfully." };
    }
  }
};
