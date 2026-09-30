/**
 * DREAM CART BD — MASTER CONFIGURATION & ENVIRONMENT
 * Centralized Settings, Constants, Role Definitions & Sheet Names Mapping
 */

const CONFIG = {
  SHOP: {
    NAME: "Dream Cart BD",
    OWNERS: ["Jainal Abedin", "MD. Saiful Islam"],
    LOGO_URL: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg",
    ADDRESS: "Chawdhury Plaza, ground floor, room#03, Paduar Bazar, Bishwa Road, Sadar Dakshin, Cumilla-3500.",
    PHONE_1: "01581703822",
    PHONE_2: "01818273838",
    BKASH_PERSONAL: "01879653143",
    BKASH_MERCHANT: "01581703822",
    BKASH_PAYMENT_LINK: "https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink",
    NAGAD_PERSONAL: "01879653143",
    ROCKET_PERSONAL: "01581703822",
    BANK: {
      NAME: "Islami Bank Bangladesh PLC",
      SWIFT: "IBBLBDDH",
      ACCOUNT_NAME: "Jainal Abedin",
      ACCOUNT_NUMBER: "20508070200030208",
      BRANCH: "Maheshkhali Sub branch",
      ROUTING: "125260525"
    },
    OFFICE_HOURS: "Every Day 8:00 AM to 10:00 PM",
    DELIVERY_AREA: "Whole Bangladesh",
    DELIVERY_FEES: {
      IN_CUMILLA: 70,
      IN_DHAKA: 90,
      OUT_OF_DHAKA: 120,
      OFFICE_PICKUP: 0
    },
    FREE_DELIVERY_THRESHOLD: 2000,
    ONLINE_PAYMENT_DISCOUNT_PERCENT: 5,
    DEVELOPER: {
      NAME: "Jainal Abedin",
      ROLE: "CEO, Dream Career IT BD",
      WEBSITE: "https://dcitbd.github.io/Jainal-Abedin/",
      COMPANY_WEBSITE: "https://dcitbd.github.io/dcitbd/"
    }
  },

  APP_NAME: "Dream Cart BD",
  VERSION: "2.5.0-PROD",
  ENV: "production",
  SPREADSHEET_ID: "19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc",
  DRIVE_ROOT_FOLDER_NAME: "DreamCartBD_Media_Storage",
  SESSION_TTL_HOURS: 72,
  OTP_TTL_MINUTES: 5,
  CACHE_TTL_SECONDS: 600, // 10 minutes default cache
  CACHE_SHORT_TTL: 60,
  CACHE_LONG_TTL: 3600,
  
  ROLES: {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    STAFF: "STAFF",
    SELLER: "SELLER",
    RESELLER: "RESELLER",
    WHOLESALE: "WHOLESALE_CUSTOMER",
    CUSTOMER: "CUSTOMER"
  },
  
  ORDER_STATUS: {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PROCESSING",
    READY_TO_SHIP: "READY_TO_SHIP",
    SHIPPED: "SHIPPED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
    RTO: "RTO",
    RETURN_REQUESTED: "RETURN_REQUESTED",
    RETURN_APPROVED: "RETURN_APPROVED",
    RETURN_RECEIVED: "RETURN_RECEIVED",
    REFUNDED: "REFUNDED"
  },
  
  STOCK_TYPES: {
    AVAILABLE: "AVAILABLE",
    PHYSICAL: "PHYSICAL",
    RESERVED: "RESERVED",
    DAMAGED: "DAMAGED"
  },
  
  SELLER_STATUS: {
    PENDING: "pending",
    APPROVED: "approved",
    SUSPENDED: "suspended",
    REJECTED: "rejected",
    BLOCKED: "blocked"
  },

  SHEETS: {
    // Core & Users
    USERS: "01_Users",
    SESSIONS: "02_Sessions",
    ROLES: "03_Roles",
    PERMISSIONS: "04_Permissions",
    
    // Catalog & Master Data
    CATEGORIES: "05_Categories",
    PRODUCTS: "06_Products",
    VARIANTS: "07_Variants",
    IMAGES: "08_Images",
    BRANDS: "09_Brands",
    ATTRIBUTES: "10_Attributes",
    
    // Multi-Vendor Enhancements
    SELLER_APPLICATIONS: "68_Seller_Applications",
    SELLER_STORES: "69_Seller_Stores",
    PRODUCT_OFFERS: "70_Product_Offers",
    SELLER_INVENTORY: "71_Seller_Inventory",
    
    // Orders & Transactions
    ORDERS: "15_Orders",
    ORDER_ITEMS: "16_Order_Items",
    SUB_ORDERS: "80_Sub_Orders",
    ORDER_NOTES: "81_Order_Notes",
    ORDER_ASSIGNMENTS: "82_Order_Assignments",
    STOCK_RESERVATIONS: "84_Stock_Reservations",
    
    // Marketing & CRM
    COUPONS: "72_Coupons",
    COUPON_USAGE: "73_Coupon_Usage",
    PROMOTIONS: "74_Promotions",
    WISHLISTS: "75_Wishlists_Events",
    REVIEWS: "25_Reviews",
    CUSTOMERS: "20_Customers",
    
    // Payments & Courier
    PAYMENTS: "30_Payments",
    PAYMENT_RECONCILIATION: "79_Payment_Reconciliation",
    COURIERS: "32_Couriers",
    FRAUD_RECORDS: "35_Fraud_Records",
    
    // System, Analytics & Automation
    DAILY_SALES_SUMMARY: "40_Daily_Sales_Summary",
    DAILY_ORDERS_SUMMARY: "41_Daily_Orders_Summary",
    KPI_SUMMARY: "45_KPI_Summary",
    ACTIVITY_LOGS: "50_Activity_Logs",
    API_LOGS: "78_API_Logs",
    WEBHOOK_EVENTS: "85_Webhook_Events",
    NOTIFICATIONS_QUEUE: "76_Notifications_Queue",
    BACKGROUND_JOBS: "77_Background_Jobs",
    SEARCH_INDEX: "86_Search_Index",
    CACHE_META: "87_Cache_Meta",
    SUPPORT_TICKETS: "88_Support_Tickets",
    SUPPORT_MESSAGES: "89_Support_Messages",
    LOGIN_ATTEMPTS: "91_Login_Attempts",
    SELLER_PAYOUTS: "92_Seller_Payouts",
    SYSTEM_SETTINGS: "60_System_Settings"
  },
  
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME_MINUTES: 15,
    SALT_ROUNDS: 10,
    SIGNATURE_SECRET_KEY_PROP: "DCBD_WEBHOOK_SECRET",
    ADMIN_NOTIFICATION_EMAIL: "admin@dreamcartbd.com"
  }
};

if (typeof module !== 'undefined') {
  module.exports = CONFIG;
}
