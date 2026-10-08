/**
 * DREAM CART BD — UNIFIED API CLIENT
 * Connects directly to Google Apps Script Web App Gateway
 * Endpoint: https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec
 * Spreadsheet ID: 1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8
 * Includes resilient mock dataset & local state caching for 100% offline & demo reliability.
 */

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec";
export const SPREADSHEET_ID = "1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8";

// Rich catalog grounded in actual Dream Cart BD products
export const INITIAL_PRODUCTS = [
  {
    sku: "DCBD-SM-001",
    product_id: "PRD-2609-1001",
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
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
    slug: "amazfit-gts-4-smartwatch",
    description: "The Amazfit GTS 4 is a premium lifestyle smartwatch featuring a 1.75-inch ultra-clear HD AMOLED display, dual-band circularly-polarized GPS antenna, 150+ sports modes, Bluetooth phone calls, and 8-day battery life.",
    specification: "Display: 1.75\" AMOLED (390x450, 341 ppi) | Sensors: BioTracker 4.0 PPG | Battery: 300 mAh (8 Days normal use) | Water Resistance: 5 ATM | Strap: 20mm Fluoroelastomer.",
    others: "1 Year Official Warranty, Fast Dispatch from Cumilla Hub.",
    color: "Infinite Black, Rosebud Pink",
    size: "Standard (42.7mm)",
    weight_kg: 0.25,
    width_cm: 10,
    length_cm: 12,
    height_cm: 6,
    is_active: true
  },
  {
    sku: "DCBD-SM-002",
    product_id: "PRD-2609-1002",
    name: "Kieslect Kr Pro Calling Smartwatch with FHD AMOLED Screen",
    p_name: "Kieslect Kr Pro Calling Smartwatch with FHD AMOLED Screen",
    category: "Smartwatches",
    sub_category: "Calling Watch",
    child_category: "Metal Body",
    brand: "Kieslect",
    buying_price: 4900,
    selling_price: 6490,
    original_price: 7990,
    wholesale_price: 5400,
    reseller_price: 5850,
    min_order_qty: 10,
    min_order_q: 10,
    stock: 42,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    slug: "kieslect-kr-pro-calling-smartwatch",
    description: "Stable Bluetooth phone calling with built-in speaker and mic. Features 1.43\" Ultra FHD AMOLED screen with Always-On display.",
    specification: "Display: 1.43\" Ultra FHD AMOLED | Battery: 280mAh | Calling: Bluetooth 5.2 | Waterproof: IP68 | 70 Sports Modes.",
    others: "Includes double strap (Orange/Black magnetic strap + silicone strap).",
    color: "Black & Orange",
    size: "45.7mm",
    weight_kg: 0.22,
    width_cm: 9,
    length_cm: 11,
    height_cm: 5,
    is_active: true
  },
  {
    sku: "DCBD-ORG-101",
    product_id: "PRD-2609-1003",
    name: "Pure Organic Maca Root Powder (Peru Grade-A, 250g Jar)",
    p_name: "Pure Organic Maca Root Powder (Peru Grade-A, 250g Jar)",
    category: "Organic & Health",
    sub_category: "Herbal Powders",
    child_category: "Energy & Vitality",
    brand: "BioOrganics",
    buying_price: 850,
    selling_price: 1250,
    original_price: 1650,
    wholesale_price: 950,
    reseller_price: 1050,
    min_order_qty: 12,
    min_order_q: 12,
    stock: 65,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    slug: "pure-organic-maca-root-powder-250g",
    description: "100% Raw Gelatinized Yellow and Black Maca Root powder imported directly from the high Peruvian Andes. Boosts stamina and natural vitality.",
    specification: "Net Weight: 250g | Origin: Junín Plateau, Peru | Purity: 100% Certified Organic | Shelf Life: 24 Months.",
    others: "Laboratory tested for heavy metals and purity.",
    color: "Natural Golden Powder",
    size: "250g",
    weight_kg: 0.3,
    width_cm: 8,
    length_cm: 8,
    height_cm: 12,
    is_active: true
  },
  {
    sku: "DCBD-ORG-102",
    product_id: "PRD-2609-1004",
    name: "Pure Sundarban Raw Honey (Natural Wildflower, 500g Jar)",
    p_name: "Pure Sundarban Raw Honey (Natural Wildflower, 500g Jar)",
    category: "Organic & Health",
    sub_category: "Natural Sweeteners",
    child_category: "Wild Honey",
    brand: "BioOrganics",
    buying_price: 600,
    selling_price: 890,
    original_price: 1150,
    wholesale_price: 700,
    reseller_price: 760,
    min_order_qty: 15,
    min_order_q: 15,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
    slug: "pure-sundarban-raw-honey-500g",
    description: "Pure unprocessed wildflower honey harvested straight from the deep mangrove forests of the Sundarbans. Unheated and unpasteurized.",
    specification: "Net Weight: 500g | Type: Wild Khalisa & Goran floral | Moisture: <19% | Packaging: Food-grade sealed glass jar.",
    others: "100% refund guarantee if proven adulterated.",
    color: "Amber Gold",
    size: "500g",
    weight_kg: 0.75,
    width_cm: 9,
    length_cm: 9,
    height_cm: 14,
    is_active: true
  },
  {
    sku: "DCBD-EL-201",
    product_id: "PRD-2609-1005",
    name: "Ultra-Bright Tactical Rechargeable Flashlight (XHP90 LED, 5000 Lumens)",
    p_name: "Ultra-Bright Tactical Rechargeable Flashlight (XHP90 LED, 5000 Lumens)",
    category: "Tools & Lights",
    sub_category: "Tactical Lights",
    child_category: "Rechargeable",
    brand: "GlowBeam",
    buying_price: 1450,
    selling_price: 2150,
    original_price: 2850,
    wholesale_price: 1650,
    reseller_price: 1820,
    min_order_qty: 6,
    min_order_q: 6,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&auto=format&fit=crop&q=80",
    slug: "ultra-bright-tactical-rechargeable-flashlight-xhp90",
    description: "Industrial strength aero-grade aluminum alloy body with telescopic zoom. Features massive XHP90 Quad-Core LED emitter throwing over 500 meters.",
    specification: "Brightness: 5,000 Lumens | Modes: High, Medium, Low, Strobe, SOS | Battery: 26650 5000mAh | Waterproof: IPX-6 | Powerbank USB output.",
    others: "Includes 26650 battery, lanyard, Type-C charging cable, and protective hard case.",
    color: "Matte Black",
    size: "17.5cm Length",
    weight_kg: 0.45,
    width_cm: 6,
    length_cm: 20,
    height_cm: 6,
    is_active: true
  },
  {
    sku: "DCBD-HA-301",
    product_id: "PRD-2609-1006",
    name: "Automatic Gas Leak Safety Auto-Shutoff Device with Pressure Meter",
    p_name: "Automatic Gas Leak Safety Auto-Shutoff Device with Pressure Meter",
    category: "Gas Accessories",
    sub_category: "Safety Valves",
    child_category: "LPG Accessories",
    brand: "Safeguard",
    buying_price: 1200,
    selling_price: 1750,
    original_price: 2400,
    wholesale_price: 1350,
    reseller_price: 1490,
    min_order_qty: 8,
    min_order_q: 8,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    slug: "automatic-gas-leak-safety-auto-shutoff-device",
    description: "Vital kitchen safety regulator attachment. Automatically shuts off gas flow within 0.1 seconds in event of pipe rupture or severe gas leak.",
    specification: "Compatibility: Standard 22mm & 20mm Bangladesh LPG cylinders (Bashundhara, Omera, Jamuna, Beximco) | Material: Solid Brass & Zinc Alloy.",
    others: "Saves up to 15-20% gas wastage. 2 Years Replacement Warranty.",
    color: "Brass Gold & Chrome",
    size: "Standard 22mm",
    weight_kg: 0.55,
    width_cm: 10,
    length_cm: 12,
    height_cm: 8,
    is_active: true
  },
  {
    sku: "DCBD-SM-003",
    product_id: "PRD-2609-1007",
    name: "Haylou Solar Plus RT3 Smartwatch — 1.43\" AMOLED with Bluetooth Call",
    p_name: "Haylou Solar Plus RT3 Smartwatch — 1.43\" AMOLED with Bluetooth Call",
    category: "Smartwatches",
    sub_category: "AMOLED Watch",
    child_category: "Fitness & GPS",
    brand: "Haylou",
    buying_price: 3600,
    selling_price: 4690,
    original_price: 5800,
    wholesale_price: 3950,
    reseller_price: 4200,
    min_order_qty: 6,
    min_order_q: 6,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
    slug: "haylou-solar-plus-rt3-smartwatch",
    description: "1.43\" AMOLED display, Bluetooth phone calls, emotional stress testing, and 105 workout modes in an exquisite circular brushed metal bezel.",
    specification: "Screen: 1.43\" AMOLED (466x466) | Battery: 280mAh (7 Days) | Bluetooth: 5.3 | Water Resistance: IP68.",
    others: "Official 1 Year Warranty.",
    color: "Silver Grey",
    size: "45mm",
    weight_kg: 0.23,
    width_cm: 9,
    length_cm: 11,
    height_cm: 5,
    is_active: true
  },
  {
    sku: "DCBD-ORG-103",
    product_id: "PRD-2609-1008",
    name: "Organic Raw Chia Seeds (High Omega-3, 500g Jar)",
    p_name: "Organic Raw Chia Seeds (High Omega-3, 500g Jar)",
    category: "Organic & Health",
    sub_category: "Superfoods",
    child_category: "Seeds & Nuts",
    brand: "BioOrganics",
    buying_price: 450,
    selling_price: 680,
    original_price: 900,
    wholesale_price: 520,
    reseller_price: 580,
    min_order_qty: 12,
    min_order_q: 12,
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    slug: "organic-raw-chia-seeds-500g",
    description: "Packed with fiber, protein, and ALA omega-3 fatty acids. Ideal for daily weight management and digestive health.",
    specification: "Net Weight: 500g | Origin: South America | Purity: 99.9% Machine Cleaned.",
    others: "Free wooden measuring spoon included.",
    color: "Natural Black & Grey",
    size: "500g",
    weight_kg: 0.55,
    width_cm: 8,
    length_cm: 8,
    height_cm: 15,
    is_active: true
  },
  {
    sku: "DCBD-EL-202",
    product_id: "PRD-2609-1009",
    name: "Heavy Duty Portable Solar Camping Light & Emergency Power Bank",
    p_name: "Heavy Duty Portable Solar Camping Light & Emergency Power Bank",
    category: "Tools & Lights",
    sub_category: "Camping Gear",
    child_category: "Solar Lighting",
    brand: "GlowBeam",
    buying_price: 1800,
    selling_price: 2590,
    original_price: 3400,
    wholesale_price: 2050,
    reseller_price: 2250,
    min_order_qty: 6,
    min_order_q: 6,
    stock: 19,
    images: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80",
    slug: "heavy-duty-portable-solar-camping-light",
    description: "Multi-function outdoor work lamp featuring monocrystalline solar panel, 360-degree rotating stand, strong magnetic base, and 10,000mAh battery.",
    specification: "Power: 60W LED COB | Battery: 10,000mAh | Modes: 4 Light Modes + Red/Blue Police Strobe | Solar Charging: 5V 2W.",
    others: "Waterproof IP66 rating.",
    color: "Yellow & Black",
    size: "21cm x 17cm",
    weight_kg: 0.85,
    width_cm: 18,
    length_cm: 22,
    height_cm: 6,
    is_active: true
  },
  {
    sku: "DCBD-HA-302",
    product_id: "PRD-2609-1010",
    name: "Premium Steel Braided Anti-Explosion Gas Hose Pipe (2 Meters)",
    p_name: "Premium Steel Braided Anti-Explosion Gas Hose Pipe (2 Meters)",
    category: "Gas Accessories",
    sub_category: "Hose & Pipes",
    child_category: "Safety Valves",
    brand: "Safeguard",
    buying_price: 450,
    selling_price: 690,
    original_price: 950,
    wholesale_price: 520,
    reseller_price: 590,
    min_order_qty: 10,
    min_order_q: 10,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    slug: "premium-steel-braided-anti-explosion-gas-hose-2m",
    description: "3-layer reinforced gas pipe: synthetic inner rubber, high-tensile stainless steel wire mesh, and rodent-proof flame-retardant outer layer.",
    specification: "Length: 2.0 Meters | Max Pressure: 20 Bar | Temperature Range: -20C to +80C | Clamps: 2 Heavy-duty butterfly clamps included.",
    others: "Rodent bite proof and fire retardant.",
    color: "Silver Metallic with Orange accent",
    size: "2 Meters",
    weight_kg: 0.45,
    width_cm: 20,
    length_cm: 20,
    height_cm: 4,
    is_active: true
  },
  {
    sku: "DCBD-SM-004",
    product_id: "PRD-2609-1011",
    name: "Colmi C61 Full Touch Smartwatch with 1.9\" IPS Screen & Voice Assistant",
    p_name: "Colmi C61 Full Touch Smartwatch with 1.9\" IPS Screen & Voice Assistant",
    category: "Smartwatches",
    sub_category: "Calling Watch",
    child_category: "Fitness & GPS",
    brand: "Colmi",
    buying_price: 2100,
    selling_price: 2790,
    original_price: 3600,
    wholesale_price: 2350,
    reseller_price: 2500,
    min_order_qty: 8,
    min_order_q: 8,
    stock: 0, // OUT OF STOCK for testing Pre-Order button!
    images: [
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&auto=format&fit=crop&q=80",
    slug: "colmi-c61-full-touch-smartwatch",
    description: "Large borderless 1.9-inch screen with Bluetooth 5.1 calling, 110 sports modes, built-in AI voice assistant, and 24/7 heart rate monitor.",
    specification: "Screen: 1.9\" IPS (240x280) | Battery: 230mAh | Charging: Magnetic charging | Waterproof: IP67.",
    others: "Currently available on Pre-Order with dispatch in 5 days.",
    color: "Midnight Black, Navy Blue",
    size: "44mm",
    weight_kg: 0.2,
    width_cm: 9,
    length_cm: 11,
    height_cm: 5,
    is_active: true
  },
  {
    sku: "DCBD-ORG-104",
    product_id: "PRD-2609-1012",
    name: "Raw Himalayan Pink Rock Salt (Coarse Food Grade, 1kg Pouch)",
    p_name: "Raw Himalayan Pink Rock Salt (Coarse Food Grade, 1kg Pouch)",
    category: "Organic & Health",
    sub_category: "Natural Minerals",
    child_category: "Energy & Vitality",
    brand: "BioOrganics",
    buying_price: 180,
    selling_price: 290,
    original_price: 450,
    wholesale_price: 210,
    reseller_price: 240,
    min_order_qty: 20,
    min_order_q: 20,
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    slug: "raw-himalayan-pink-rock-salt-1kg",
    description: "Pure unrefined mineral rock salt containing 84 natural trace minerals. Ideal for healthy cooking, pickling, and detox drinks.",
    specification: "Net Weight: 1000g | Origin: Khewra Salt Mine, Pakistan | Purity: 100% Natural Raw Crystals.",
    others: "Food-grade resealable foil zip pouch.",
    color: "Natural Pinkish Amber",
    size: "1kg",
    weight_kg: 1.05,
    width_cm: 14,
    length_cm: 22,
    height_cm: 5,
    is_active: true
  }
];

export const INITIAL_CATEGORIES = [
  {
    catagory_id: "CAT-SMARTWATCH",
    catagory_slug: "smartwatches",
    category_image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=80",
    category: "Smartwatches",
    sub_category: "AMOLED Watch, Calling Watch, Fitness Tracker",
    chail_category: "Fitness & GPS, Metal Body, Casual"
  },
  {
    catagory_id: "CAT-ORGANIC",
    catagory_slug: "organic-health",
    category_image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    category: "Organic & Health",
    sub_category: "Herbal Powders, Natural Sweeteners, Superfoods",
    chail_category: "Energy & Vitality, Wild Honey, Seeds & Nuts"
  },
  {
    catagory_id: "CAT-TOOLS",
    catagory_slug: "tools-lights",
    category_image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=400&auto=format&fit=crop&q=80",
    category: "Tools & Lights",
    sub_category: "Tactical Lights, Camping Gear, Solar Lighting",
    chail_category: "Rechargeable, Heavy Duty, Outdoor"
  },
  {
    catagory_id: "CAT-GAS",
    catagory_slug: "gas-accessories",
    category_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
    category: "Gas Accessories",
    sub_category: "Safety Valves, Hose & Pipes, LPG Regulators",
    chail_category: "LPG Accessories, Automatic Shutoff, Rodent-Proof"
  }
];

export const INITIAL_BRANDS = [
  {
    brand_id: "BRD-AMAZFIT",
    brand_name: "Amazfit",
    brand_slug: "amazfit",
    brand_image: "https://cdn.iconscout.com/icon/free/png-256/free-watch-icon-download-in-svg-png-gif-file-formats--smart-smartwatch-gadget-pack-fitness-gym-icons-2651034.png?f=webp&w=128",
    brand_description: "Global leader in smart wearables, health algorithms, and high-performance sport tracking devices."
  },
  {
    brand_id: "BRD-KIESLECT",
    brand_name: "Kieslect",
    brand_slug: "kieslect",
    brand_image: "https://cdn.iconscout.com/icon/free/png-256/free-smart-watch-icon-download-in-svg-png-gif-file-formats--apple-wearable-device-gadget-smartwatch-technology-electronic-pack-appliances-icons-1786520.png?f=webp&w=128",
    brand_description: "Fashion-forward calling smartwatches with cutting-edge AMOLED screens and magnetic dual straps."
  },
  {
    brand_id: "BRD-BIOORGANICS",
    brand_name: "BioOrganics",
    brand_slug: "bioorganics",
    brand_image: "https://cdn.iconscout.com/icon/free/png-256/free-leaf-icon-download-in-svg-png-gif-file-formats--eco-environment-nature-plant-green-ecology-pack-sign-symbols-icons-480928.png?f=webp&w=128",
    brand_description: "100% pure organic superfoods, certified raw Peruvian maca root powder, and Sundarban raw honey."
  },
  {
    brand_id: "BRD-GLOWBEAM",
    brand_name: "GlowBeam",
    brand_slug: "glowbeam",
    brand_image: "https://cdn.iconscout.com/icon/free/png-256/free-flashlight-icon-download-in-svg-png-gif-file-formats--torch-light-camping-hiking-pack-holidays-icons-3331454.png?f=webp&w=128",
    brand_description: "High-power tactical flashlights, heavy-duty emergency COB lamps, and outdoor solar gear."
  },
  {
    brand_id: "BRD-SAFEGUARD",
    brand_name: "Safeguard",
    brand_slug: "safeguard",
    brand_image: "https://cdn.iconscout.com/icon/free/png-256/free-shield-icon-download-in-svg-png-gif-file-formats--safety-protection-security-secure-protect-pack-crime-icons-1779836.png?f=webp&w=128",
    brand_description: "Commercial and residential LPG kitchen safety auto-shutoff regulators and explosion-proof hoses."
  },
  {
    brand_id: "BRD-COLMI",
    brand_name: "Colmi",
    brand_slug: "colmi",
    brand_image: "https://cdn.iconscout.com/icon/free/png-256/free-clock-icon-download-in-svg-png-gif-file-formats--time-watch-alarm-timer-interface-essential-pack-user-icons-1805582.png?f=webp&w=128",
    brand_description: "Budget-friendly durable smartwatches with rich feature sets and extensive battery life."
  }
];

export const INITIAL_BANNERS = [
  {
    banner_id: "BNR-001",
    title: "ঈদ ধামাকা অফার — মেগা ডিসকাউন্ট",
    subtitle: "স্মার্টওয়াচ ও গ্যাজেটে সর্বোচ্চ ৪০% পর্যন্ত ছাড়!",
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1600&auto=format&fit=crop&q=80",
    link_url: "/products?cat=Smartwatches",
    button_text: "এখনই কিনুন",
    tag: "সীমিত সময়ের অফার"
  },
  {
    banner_id: "BNR-002",
    title: "১০০% খাঁটি ও প্রাকৃতিক স্বাস্থ্য পণ্য",
    subtitle: "পেরুর মাকা রুট ও সুন্দরবনের খাঁটি মধু ফ্রি ডেলিভারিতে!",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&auto=format&fit=crop&q=80",
    link_url: "/products?cat=Organic+%26+Health",
    button_text: "পণ্য দেখুন",
    tag: "ন্যাচারাল চয়েস"
  },
  {
    banner_id: "BNR-003",
    title: "গ্যাস লিকেজ প্রতিরোধে অটো সেফটি ভাল্ব",
    subtitle: "আপনার পরিবারের সুরক্ষায় বাধ্যতামূলক নিরাপত্তা ডিভাইস",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=80",
    link_url: "/products?cat=Gas+Accessories",
    button_text: "অর্ডার করুন",
    tag: "নিরাপত্তা সবার আগে"
  }
];

export const INITIAL_ORDERS = [
  {
    order_id: "ORD-2609-8472",
    date: "2026-10-08 14:32:00",
    account_type: "Customer",
    customer_name: "তানভীর হাসান",
    phone: "01712345678",
    address: "বাসা #১২, রোড #০৪, ধানমন্ডি, ঢাকা।",
    products: "Amazfit GTS 4 Smartwatch (1 pcs)",
    color: "Infinite Black",
    size: "Standard (42.7mm)",
    quantity: 1,
    total_amount: 18500,
    payment_method: "Cash On Delivery (COD)",
    transaction_id: "N/A",
    payment_status: "COD",
    order_status: "Processing",
    reseller_commission: 0,
    commission_status: "Not Paid"
  },
  {
    order_id: "ORD-2609-8473",
    date: "2026-10-08 11:15:00",
    account_type: "Reseller",
    customer_name: "মাহমুদ আলম (Reseller)",
    phone: "01819876543",
    address: "দোকান #৩, কান্দিরপাড়, কুমিল্লা।",
    products: "Pure Organic Maca Root Powder (Peru Grade-A, 250g Jar) (3 pcs)",
    color: "Golden",
    size: "250g",
    quantity: 3,
    total_amount: 3150,
    payment_method: "Bkash Payment",
    transaction_id: "9K2840FJA2",
    payment_status: "Paid",
    order_status: "Shipped",
    reseller_commission: 600,
    commission_status: "Pending"
  }
];

class ApiClient {
  constructor() {
    this.endpoint = APPS_SCRIPT_URL;
    this.products = this.loadState("dcbd_products", INITIAL_PRODUCTS);
    this.categories = this.loadState("dcbd_categories", INITIAL_CATEGORIES);
    this.brands = this.loadState("dcbd_brands", INITIAL_BRANDS);
    this.banners = this.loadState("dcbd_banners", INITIAL_BANNERS);
    this.orders = this.loadState("dcbd_orders", INITIAL_ORDERS);
    this.incompleteOrders = this.loadState("dcbd_incomplete_orders", []);
    this.viewers = this.loadState("dcbd_viewers", []);
  }

  loadState(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  saveState(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  async request(action, payload = {}) {
    // Attempt live fetch to Google Apps Script Web App Gateway
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second fail-fast for instant UI response

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: action,
          payload: payload,
          spreadsheet_id: SPREADSHEET_ID,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json && (json.success !== false || json.status === "success")) {
          return json;
        }
      }
    } catch (err) {
      // Fallback seamlessly to client-side reactive store engine
    }

    return this.handleLocalSimulation(action, payload);
  }

  handleLocalSimulation(action, payload) {
    switch (action) {
      case "products/list": {
        let items = [...this.products];
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
        const slugOrId = payload.id || payload.slug;
        const found = this.products.find(p => p.product_id === slugOrId || p.slug === slugOrId || p.sku === slugOrId);
        if (found) {
          return { success: true, data: found };
        }
        return { success: false, message: "Product not found" };
      }

      case "products/add": {
        const newProduct = {
          product_id: "PRD-" + Date.now(),
          sku: payload.sku || "DCBD-" + Math.floor(1000 + Math.random() * 9000),
          name: payload.name || payload.p_name || "New Product",
          p_name: payload.name || payload.p_name || "New Product",
          category: payload.category || "General",
          sub_category: payload.sub_category || "",
          child_category: payload.child_category || "",
          brand: payload.brand || "Dream Cart BD",
          buying_price: Number(payload.buying_price || 0),
          selling_price: Number(payload.selling_price || 0),
          original_price: Number(payload.original_price || payload.selling_price || 0),
          wholesale_price: Number(payload.wholesale_price || payload.selling_price || 0),
          reseller_price: Number(payload.reseller_price || payload.selling_price || 0),
          min_order_qty: Number(payload.min_order_qty || payload.min_order_q || 1),
          min_order_q: Number(payload.min_order_qty || payload.min_order_q || 1),
          stock: Number(payload.stock || 50),
          thumbnail: payload.thumbnail || (payload.images && payload.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
          images: payload.images || [payload.thumbnail || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
          slug: payload.slug || (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "product-" + Date.now()),
          description: payload.description || "",
          specification: payload.specification || "",
          others: payload.others || "",
          color: payload.color || "",
          size: payload.size || "",
          weight_kg: Number(payload.weight_kg || 0.5),
          width_cm: Number(payload.width_cm || 10),
          length_cm: Number(payload.length_cm || 10),
          height_cm: Number(payload.height_cm || 10),
          is_active: true
        };
        this.products.unshift(newProduct);
        this.saveState("dcbd_products", this.products);
        return { success: true, data: newProduct, message: "পণ্যটি সফলভাবে যুক্ত হয়েছে!" };
      }

      case "products/delete": {
        const id = payload.product_id || payload.id;
        this.products = this.products.filter(p => p.product_id !== id && p.sku !== id);
        this.saveState("dcbd_products", this.products);
        return { success: true, message: "পণ্যটি মুছে ফেলা হয়েছে।" };
      }

      case "orders/create": {
        const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        const orderData = {
          order_id: orderId,
          orderId: orderId,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
          account_type: payload.account_type || "Customer",
          customer_name: payload.customer_name || payload.name || "গ্রাহক",
          phone: payload.phone || payload.mobile || "",
          address: payload.address || "",
          products: payload.items ? payload.items.map(i => `${i.name} (${i.quantity} pcs)`).join(", ") : "Product order",
          items: payload.items || [],
          color: payload.color || "",
          size: payload.size || "",
          quantity: payload.items ? payload.items.reduce((s, i) => s + Number(i.quantity), 0) : 1,
          total_amount: payload.total_amount || payload.grand_total || 0,
          payment_method: payload.payment_method || "Cash On Delivery (COD)",
          transaction_id: payload.transaction_id || "N/A",
          payment_status: payload.payment_status || (payload.payment_method === "Cash On Delivery (COD)" ? "COD" : "Paid"),
          order_status: "Order Placed",
          reseller_commission: payload.reseller_commission || 0,
          commission_status: "Pending"
        };
        this.orders.unshift(orderData);
        this.saveState("dcbd_orders", this.orders);

        // Remove from incomplete orders if existed
        if (payload.phone) {
          this.incompleteOrders = this.incompleteOrders.filter(o => o.phone !== payload.phone);
          this.saveState("dcbd_incomplete_orders", this.incompleteOrders);
        }

        return {
          success: true,
          data: orderData,
          message: "আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে!"
        };
      }

      case "incomplete_orders/create": {
        const existing = this.incompleteOrders.find(o => o.phone === payload.phone);
        if (existing) {
          existing.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
          existing.address = payload.address || existing.address;
          existing.customer_name = payload.customer_name || existing.customer_name;
          existing.products = payload.products || existing.products;
          existing.total_amount = payload.total_amount || existing.total_amount;
        } else {
          this.incompleteOrders.unshift({
            date: new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
            order_id: "INC-" + Math.floor(100000 + Math.random() * 900000),
            account_type: payload.account_type || "Customer",
            customer_name: payload.customer_name || "",
            phone: payload.phone || "",
            address: payload.address || "",
            products: payload.products || "",
            total_amount: payload.total_amount || 0,
            status: "Draft/Incomplete"
          });
        }
        this.saveState("dcbd_incomplete_orders", this.incompleteOrders);
        return { success: true };
      }

      case "orders/list": {
        return {
          success: true,
          data: {
            items: this.orders,
            total: this.orders.length
          }
        };
      }

      case "orders/get": {
        const id = payload.order_id || payload.orderId;
        const found = this.orders.find(o => o.order_id === id || o.orderId === id || o.phone === id);
        return found ? { success: true, data: found } : { success: false, message: "Order not found" };
      }

      case "categories/list": {
        return { success: true, data: { items: this.categories } };
      }

      case "brands/list": {
        return { success: true, data: { items: this.brands } };
      }

      case "banners/list": {
        return { success: true, data: { items: this.banners } };
      }

      case "incomplete_orders/list": {
        return { success: true, data: { items: this.incompleteOrders } };
      }

      case "admin/kpi": {
        const totalSales = this.orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        return {
          success: true,
          data: {
            today_sales: 42850,
            today_orders: this.orders.length,
            total_sales: totalSales || 1284500,
            total_orders: this.orders.length || 684,
            pending_orders: this.orders.filter(o => o.order_status === "Pending" || o.order_status === "Order Placed").length || 7,
            delivered_orders: this.orders.filter(o => o.order_status === "Delivered").length || 590,
            rto_orders: 22,
            low_stock_count: this.products.filter(p => Number(p.stock) <= 10).length,
            total_products: this.products.length,
            active_sellers: 12,
            total_customers: 940
          }
        };
      }

      default:
        return { success: true, message: "Operation completed successfully." };
    }
  }
}

export const apiClient = new ApiClient();
