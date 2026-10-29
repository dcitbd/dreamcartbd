/**
 * DREAM CART BD — MODULAR MULTI-PAGE ADMIN PORTAL CONTROLLER (AdminPortal.js)
 * Clean, lightweight route-based controller rendering dedicated page modules:
 * - /admin/dashboard   -> adminDashboard.js
 * - /admin/products    -> adminProductCatalog.js
 * - /admin/addproduct  -> adminAddProduct.js
 * - /admin/categroy    -> adminCategoryBrand.js
 * - /admin/brands      -> adminCategoryBrand.js
 * - /admin/bulk-upload -> adminBulkTools.js
 * - /admin/bulk-price  -> adminBulkTools.js
 * - /admin/bulk-image  -> adminBulkTools.js
 * - /admin/landing     -> adminLandingCms.js
 * - /admin/orders      -> adminOrders.js
 * - /admin/resellers   -> adminPartners.js
 * - /admin/reports     -> adminReports.js
 * - /admin/payouts     -> adminInventory.js
 * - /admin/couriers    -> adminCouriersSettings.js
 * - /admin/others      -> adminOthers.js
 */

import { apiClient } from '../../api/client.js';
import { authStore } from '../../store/authStore.js';
import { initAdminGlobalState, resolveAdminRoute } from './modules/adminState.js';
import { renderSidebarAndTopbar } from './modules/adminSidebar.js';
import { renderDashboardModule } from './modules/adminDashboard.js';
import {
  renderProductCatalogModule,
  renderAddProductModule,
  renderCategoryBrandModule,
  renderBulkToolsModule,
  renderLandingCmsModule,
  renderOthersModule
} from './modules/adminProducts.js';
import { renderOrdersModule } from './modules/adminOrders.js';
import { renderPartnersModule } from './modules/adminPartners.js';
import { renderReportsModule } from './modules/adminReports.js';
import { renderInventoryModule } from './modules/adminInventory.js';
import { renderCouriersSettingsModule } from './modules/adminCouriersSettings.js';

initAdminGlobalState();

async function safeFetchWithTimeout(fetchPromise, timeoutMs = 1200, fallbackVal = null) {
  try {
    const timeout = new Promise(resolve => setTimeout(() => resolve(fallbackVal), timeoutMs));
    const result = await Promise.race([fetchPromise, timeout]);
    return result || fallbackVal;
  } catch (e) {
    return fallbackVal;
  }
}

async function hydrateAdminDataIfNeeded() {
  const st = window.__adminState || {};
  if (window.__adminHydratedOnce && Array.isArray(st.products) && st.products.length > 0) {
    return st;
  }

  const cachedProducts = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_products', []) : [];
  const cachedOrders = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_orders', []) : [];
  const cachedCategories = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_categories', []) : [];
  const cachedBrands = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_brands', []) : [];
  const cachedBanners = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_banners', []) : [];
  const cachedIncomplete = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_incomplete_orders', []) : [];

  const [prodRes, orderRes, catRes, brandRes, bannerRes, incRes] = await Promise.all([
    safeFetchWithTimeout(apiClient.request('products/list'), 1200, { data: { items: cachedProducts } }),
    safeFetchWithTimeout(apiClient.request('orders/list'), 1200, { data: { items: cachedOrders } }),
    safeFetchWithTimeout(apiClient.request('categories/list'), 1200, { data: { items: cachedCategories } }),
    safeFetchWithTimeout(apiClient.request('brands/list'), 1200, { data: { items: cachedBrands } }),
    safeFetchWithTimeout(apiClient.request('banners/list'), 1200, { data: { items: cachedBanners } }),
    safeFetchWithTimeout(apiClient.request('incomplete_orders/list'), 1200, { data: { items: cachedIncomplete } })
  ]);

  const rawProducts = (prodRes?.data?.items?.length ? prodRes.data.items : cachedProducts) || [];
  const products = rawProducts.length > 0 ? rawProducts : (apiClient.localProducts || [
    { product_id: 'PRD-101', sku: 'DCBD-WT-01', name: 'Amazfit GTS 4 Smartwatch (Black)', category: 'Smartwatches', sub_category: 'AMOLED Watch', child_category: 'Men', brand: 'Amazfit', selling_price: 8490, original_price: 11462, wholesale_price: 7200, buying_price: 6800, min_order_q: 5, stock: 18, thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-102', sku: 'DCBD-GS-02', name: 'অটো গ্যাস সেফটি ডিভাইস (Heavy Duty)', category: 'Kitchen', sub_category: 'Safety Device', child_category: 'Appliances', brand: 'HK', selling_price: 2450, original_price: 3504, wholesale_price: 1850, buying_price: 1500, min_order_q: 5, stock: 4, thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-103', sku: 'DCBD-HN-03', name: 'সুন্দরবনের খাঁটি চাকের মধু (১ কেজি)', category: 'Organic & Health', sub_category: 'Honey', child_category: 'Pure Natural', brand: 'Dream Organic', selling_price: 1250, original_price: 1813, wholesale_price: 950, buying_price: 800, min_order_q: 5, stock: 0, thumbnail: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-104', sku: 'DCBD-FL-04', name: 'মিলিটারি রিচার্জেবল ফ্ল্যাশলাইট ৩০০০ লুমেন', category: 'Home Appliances', sub_category: 'Lighting', child_category: 'Rechargeable', brand: 'HK', selling_price: 1450, original_price: 2103, wholesale_price: 1100, buying_price: 900, min_order_q: 5, stock: 2, thumbnail: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-105', sku: 'DCBD-CH-05', name: 'অর্গানিক চিয়া সিড (৫০০ গ্রাম জার)', category: 'Organic & Health', sub_category: 'Seeds', child_category: 'Pure Natural', brand: 'Dream Organic', selling_price: 650, original_price: 956, wholesale_price: 480, buying_price: 400, min_order_q: 5, stock: 45, thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-106', sku: 'DCBD-BL-06', name: 'হাই-স্পিড মাল্টিফাংশন পোর্টেবল ব্লেন্ডার', category: 'Kitchen', sub_category: 'Blender', child_category: 'Appliances', brand: 'HK', selling_price: 1850, original_price: 2646, wholesale_price: 1400, buying_price: 1200, min_order_q: 5, stock: 0, thumbnail: '', status: 'সক্রিয়' }
  ]);

  const rawOrders = (orderRes?.data?.items?.length ? orderRes.data.items : cachedOrders) || [];
  const orders = rawOrders.length > 0 ? rawOrders : [
    { order_id: 'ORD-9482-710', customer_name: 'তানভীর আহমেদ', phone: '01711223344', address: 'বাড়ি #১২, রোড #৪, ধানমন্ডি, ঢাকা', products: 'Amazfit GTS 4 Smartwatch', size: 'Regular', color: 'Jet Black', quantity: 1, unit_price: 8490, total_amount: 8490, payment_method: 'Cash on Delivery', payment_status: 'Pending', order_status: 'Processing', transaction_id: 'COD-UNPAID', fraud_status: 'Safe (98%)', customer_rating: '5/5 ★' },
    { order_id: 'ORD-8472-319', customer_name: 'সুলতানা জাহান', phone: '01819876543', address: 'মেইন রোড, কান্দিরপাড়, কুমিল্লা', products: 'অটো গ্যাস সেফটি ডিভাইস', size: 'Heavy', color: 'Red/Black', quantity: 1, unit_price: 2450, total_amount: 2520, payment_method: 'bKash Online', payment_status: 'Paid', order_status: 'Shipped', transaction_id: 'BK-98472910', fraud_status: 'Safe (99%)', customer_rating: '5/5 ★' },
    { order_id: 'ORD-7291-504', customer_name: 'মাহমুদুর রহমান', phone: '01912345678', address: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম', products: 'মিলিটারি রিচার্জেবল ফ্ল্যাশলাইট', size: 'Standard', color: 'Army Green', quantity: 1, unit_price: 1450, total_amount: 1570, payment_method: 'Cash on Delivery', payment_status: 'Paid', order_status: 'Delivered', transaction_id: 'COD-PAID-01', fraud_status: 'Safe (95%)', customer_rating: '5/5 ★' },
    { order_id: 'ORD-6120-198', customer_name: 'নুসরাত শারমিন', phone: '01581234567', address: 'উপশহর, সেক্টর #২, রাজশাহী', products: 'অর্গানিক চিয়া সিড (৫০০ গ্রাম)', size: '500g', color: 'Natural', quantity: 2, unit_price: 650, total_amount: 1420, payment_method: 'Cash on Delivery', payment_status: 'Pending', order_status: 'Order Placed', transaction_id: 'COD-UNPAID', fraud_status: 'Safe (94%)', customer_rating: '4.8/5 ★' },
    { order_id: 'ORD-5019-214', customer_name: 'কবির হোসেন', phone: '01799887744', address: 'সোনাডাঙ্গা বাসস্ট্যান্ড, খুলনা', products: 'হাই-স্পিড পোর্টেবল ব্লেন্ডার', size: 'Compact', color: 'Silver', quantity: 1, unit_price: 1850, total_amount: 1970, payment_method: 'Cash on Delivery', payment_status: 'Pending', order_status: 'Delivered', transaction_id: 'COD-UNPAID', fraud_status: 'Moderate (75%)', customer_rating: '4/5 ★' },
    { order_id: 'ORD-4190-881', customer_name: 'শারমিন সুলতানা', phone: '01622334488', address: 'চৌহাট্টা, সিলেট সদর, সিলেট', products: 'সুন্দরবনের চাকের মধু (১ কেজি)', size: '1kg', color: 'Pure Amber', quantity: 1, unit_price: 1250, total_amount: 1370, payment_method: 'bKash Online', payment_status: 'Paid', order_status: 'Cancelled', transaction_id: 'BK-REFUNDED', fraud_status: 'High Risk (40%)', customer_rating: '3/5 ★' }
  ];

  const categories = (catRes?.data?.items?.length ? catRes.data.items : cachedCategories) || [
    { catagory_id: 'CAT-101', category: 'Smartwatches', sub_category: 'AMOLED Watch, Calling Watch', chail_category: 'Men, Women' },
    { catagory_id: 'CAT-102', category: 'Kitchen', sub_category: 'Safety Device, Blender, Cookware', chail_category: 'Appliances' },
    { catagory_id: 'CAT-103', category: 'Organic & Health', sub_category: 'Honey, Seeds, Oils', chail_category: 'Pure Natural' },
    { catagory_id: 'CAT-104', category: 'Home Appliances', sub_category: 'Lighting, Gadgets', chail_category: 'Rechargeable' }
  ];

  const brands = (brandRes?.data?.items?.length ? brandRes.data.items : cachedBrands) || [
    { brand_id: 'BRD-101', brand_name: 'Amazfit', brand_image: 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg', brand_description: 'স্মার্ট পরিধানযোগ্য ও ফিটনেস ডিভাইস।' },
    { brand_id: 'BRD-102', brand_name: 'Dream Organic', brand_image: 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg', brand_description: '১০০% বিশুদ্ধ অর্গানিক ও প্রাকৃতিক পণ্য।' },
    { brand_id: 'BRD-103', brand_name: 'HK', brand_image: 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg', brand_description: 'প্রিমিয়াম স্মার্ট গ্যাজেট পার্টনার।' }
  ];

  const banners = (bannerRes?.data?.items?.length ? bannerRes.data.items : cachedBanners) || [
    { banner_id: 'BAN-01', title: 'স্মার্ট কিচেন ও নিরাপদ কুকিং গ্যাজেট', subtitle: 'সর্বোচ্চ ৩০% বিশেষ ছাড় চলছে!', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', link_url: '/products?cat=Kitchen', status: 'Active' },
    { banner_id: 'BAN-02', title: '১০০% খাঁটি অর্গানিক ফুড ও সাপ্লিমেন্ট', subtitle: 'সুন্দরবনের প্রাকৃতিক চাকের মধু ও চিয়া সিড', image_url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600', link_url: '/products?cat=Organic%20%26%20Health', status: 'Active' }
  ];

  const rawIncomplete = (incRes?.data?.items?.length ? incRes.data.items : cachedIncomplete) || [];
  const incompleteOrders = rawIncomplete.length > 0 ? rawIncomplete : [
    { order_id: 'INC-2091', date: 'আজ ১২:৪৫ PM', customer_name: 'রফিকুল ইসলাম', phone: '01688776655', address: 'মিরপুর-১০, ঢাকা', total_amount: 2450 },
    { order_id: 'INC-2089', date: 'গতকাল ৫:২০ PM', customer_name: 'ফারহানা করিম', phone: '01722334455', address: 'টমছম ব্রিজ, কুমিল্লা', total_amount: 1850 }
  ];

  const resellers = JSON.parse(localStorage.getItem('dcbd_resellers') || JSON.stringify([
    { id: 'RSL-9082', name: 'মোঃ মাহমুদ', shop: 'ফ্যাশন পয়েন্ট', phone: '01819876543', city: 'কুমিল্লা', balance: 1200, total_earned: 14500, status: 'Active' },
    { id: 'RSL-9085', name: 'আরিফুল ইসলাম', shop: 'গ্যাজেট ওয়ার্ল্ড', phone: '01712345678', city: 'ঢাকা', balance: 3450, total_earned: 28900, status: 'Active' },
    { id: 'RSL-9091', name: 'রুমানা আহমেদ', shop: 'স্মার্ট শপ বিডি', phone: '01987654321', city: 'চট্টগ্রাম', balance: 850, total_earned: 9200, status: 'Active' }
  ]));

  const wholesalers = JSON.parse(localStorage.getItem('dcbd_wholesalers') || JSON.stringify([
    { id: 'WHS-101', name: 'হাজী মোঃ ইউসুফ', company: 'ইউসুফ এন্টারপ্রাইজ', phone: '01711002233', tier: 'Tier 1 (20% Off)', total_orders: 14, status: 'Approved' },
    { id: 'WHS-102', name: 'ফারুক ট্রেডার্স', company: 'ফারুক ব্রাদার্স হোলসেল', phone: '01812998877', tier: 'Tier 2 (15% Off)', total_orders: 9, status: 'Approved' }
  ]));

  const sellers = JSON.parse(localStorage.getItem('dcbd_sellers') || JSON.stringify([
    { id: 'VND-201', name: 'কামরুল হাসান', store: 'অরগ্যানিক ভ্যালি বিডি', phone: '01911445566', commission: '8%', products_count: 12, status: 'Active' },
    { id: 'VND-202', name: 'তানজিমুল হক', store: 'টেকহাব গ্যাজেটস', phone: '01511223344', commission: '10%', products_count: 24, status: 'Active' }
  ]));

  const markets = JSON.parse(localStorage.getItem('dcbd_markets') || JSON.stringify([
    { id: 'MKT-01', name: 'Daraz Bangladesh Shop', sync_mode: 'API Auto', status: 'Connected', last_sync: '১০ মিনিট আগে' },
    { id: 'MKT-02', name: 'Facebook & Instagram Shop', sync_mode: 'Catalog XML Feed', status: 'Active', last_sync: '১ ঘন্টা আগে' },
    { id: 'MKT-03', name: 'Bikroy Storefront', sync_mode: 'Manual Webhook', status: 'Connected', last_sync: 'আজকে' }
  ]));

  const workers = JSON.parse(localStorage.getItem('dcbd_workers') || JSON.stringify([
    { id: 'WRK-01', name: 'MD. Saiful Islam', role: 'Admin (ম্যানেজার)', phone: '01818273838', email: 'saiful@dreamcart.bd', status: 'Active' },
    { id: 'WRK-02', name: 'আসিফ ইকবাল', role: 'Order Management (অর্ডার ডেস্ক)', phone: '01722334411', email: 'asif@dreamcart.bd', status: 'Active' },
    { id: 'WRK-03', name: 'রাকিবুল হাসান', role: 'Delivery Desk (লজিস্টিকস)', phone: '01633445566', email: 'rakib@dreamcart.bd', status: 'Active' },
    { id: 'WRK-04', name: 'সাবরিনা আক্তার', role: 'Customer Support (গ্রাহক সেবা)', phone: '01511223399', email: 'sabrina@dreamcart.bd', status: 'Active' }
  ]));

  const admins = JSON.parse(localStorage.getItem('dcbd_admins') || JSON.stringify([
    { id: 'ADM-01', name: 'Jainal Abedin', email: 'ceo@dreamcart.bd', role: 'CEO & Master Admin', status: 'Active' },
    { id: 'ADM-02', name: 'MD. Saiful Islam', email: 'admin@dreamcart.bd', role: 'Lead Operations', status: 'Active' }
  ]));

  const couriers = JSON.parse(localStorage.getItem('dcbd_sheet_couriers') || JSON.stringify([
    { id: 'CUR-01', name: 'Steadfast Courier', api_key: '••••••••8492', secret_key: '••••••••9012', hub_city: 'ঢাকা / সারা দেশ', status: 'Connected', balance: '৳৪,৮৫০', webhook_url: 'https://dreamcart.bd/api/courier/steadfast/webhook' },
    { id: 'CUR-02', name: 'Pathao Courier', api_key: '••••••••3190', secret_key: '••••••••1289', hub_city: 'ঢাকা সিটি ও সাব-আরবান', status: 'Connected', balance: '৳২,১০০', webhook_url: 'https://dreamcart.bd/api/courier/pathao/webhook' },
    { id: 'CUR-03', name: 'RedX Delivery', api_key: '••••••••1042', secret_key: '••••••••4892', hub_city: 'কুমিল্লা ও চট্টগ্রাম জোন', status: 'Connected', balance: '৳১,২০০', webhook_url: 'https://dreamcart.bd/api/courier/redx/webhook' }
  ]));

  const onlinePayments = JSON.parse(localStorage.getItem('dcbd_online_payments') || JSON.stringify([
    { id: 'PAY-01', name: 'bKash Merchant Direct', merchant_id: '01818273838', api_key: '••••••••7812', mode: 'Live', status: 'Active' },
    { id: 'PAY-02', name: 'SSLCommerz Hosted Gateway', merchant_id: 'dreamcart_live', api_key: '••••••••3491', mode: 'Live', status: 'Active' },
    { id: 'PAY-03', name: 'Shurjopay FinTech', merchant_id: 'sp_dreamcart', api_key: '••••••••1104', mode: 'Live', status: 'Active' },
    { id: 'PAY-04', name: 'Nagad Direct Pay', merchant_id: '01581703822', api_key: '••••••••5523', mode: 'Live', status: 'Active' }
  ]));

  const costs = JSON.parse(localStorage.getItem('dcbd_sheet_costs') || JSON.stringify([
    { id: 'CST-01', title: 'ফেসবুক পেজ বুস্টিং ক্যাম্পেইন (অক্টোবর)', amount: 14500, category: 'মার্কেটিং ও বিজ্ঞাপন', date: '২০২৬-১০-১৫', note: 'মেটা অ্যাডস' },
    { id: 'CST-02', title: 'অফিস ও শোরুম স্পেস ভাড়া (কুমিল্লা)', amount: 18000, category: 'অফিস ভাড়া', date: '২০২৬-১০-০১', note: 'চৌধুরী প্লাজা' },
    { id: 'CST-03', title: 'কুরিয়ার প্যাকিং মেটেরিয়াল ও বাবল র‍্যাপ', amount: 3850, category: 'প্যাকেজিং', date: '২০২৬-১০-১২', note: '৫০০ পিস বক্স' },
    { id: 'CST-04', title: 'ক্লাউড হোস্টিং ও ডোমেইন সার্ভার বিল', amount: 2200, category: 'আইটি ও সার্ভার', date: '২০২৬-১০-০৫', note: 'মাসিক ডেডিকেটেড' }
  ]));

  const buying = JSON.parse(localStorage.getItem('dcbd_sheet_buying') || JSON.stringify([
    { id: 'BUY-01', supplier: 'চায়না ডিরেক্ট ইম্পোর্ট এজেন্ট', product: 'Amazfit GTS 4 Smartwatches (৫০ পিস)', quantity: 50, total_amount: 340000, date: '২০২৬-১০-০৮' },
    { id: 'BUY-02', supplier: 'সুন্দরবন হানি কো-অপারেটিভ', product: 'প্রাকৃতিক চাকের মধু (২০০ কেজি)', quantity: 200, total_amount: 160000, date: '২০২৬-১০-১০' },
    { id: 'BUY-03', supplier: 'ঢাকা ইলেকট্রনিক্স মার্কেট', product: 'অটো গ্যাস সেফটি ডিভাইস (১০০ পিস)', quantity: 100, total_amount: 150000, date: '২০২৬-১০-১৪' }
  ]));

  const invest = JSON.parse(localStorage.getItem('dcbd_sheet_invest') || JSON.stringify([
    { id: 'INV-01', investor: 'জয়নাল আবেদীন (প্রতিষ্ঠাতা)', amount: 1500000, note: 'প্রাথমিক কার্যকরী মূলধন', date: '২০২৬-০১-১৫' },
    { id: 'INV-02', investor: 'এম সাইফুল ইসলাম (পার্টনার)', amount: 1000000, note: 'ইনভেন্টরি সম্প্রসারণ বিনিয়োগ', date: '২০২৬-০৩-০১' },
    { id: 'INV-03', investor: 'অ্যাঞ্জেল ক্যাপিটাল পার্টনার্স', amount: 500000, note: 'মার্কেটিং ও কুরিয়ার লজিস্টিকস', date: '২০২৬-০৭-২০' }
  ]));

  const offers = JSON.parse(localStorage.getItem('dcbd_sheet_offers') || JSON.stringify([
    { id: 'OFF-01', code: 'DREAM10', discount: '১০% ছাড়', min_spend: 1500, status: 'Active' },
    { id: 'OFF-02', code: 'FREESHIP', discount: 'ফ্রি ডেলিভারি', min_spend: 2000, status: 'Active' },
    { id: 'OFF-03', code: 'FESTIVE500', discount: '৳৫০০ ফ্ল্যাট ছাড়', min_spend: 5000, status: 'Active' }
  ]));

  const variants = JSON.parse(localStorage.getItem('dcbd_variants') || JSON.stringify({
    colors: ['Jet Black', 'Space Silver', 'Rose Gold', 'Midnight Blue', 'Army Green', 'Pure Amber'],
    sizes: ['Free Size', 'Small', 'Medium', 'Large', 'XL', '১ কেজি', '৫০০ গ্রাম']
  }));

  const customers = orders.map(o => ({
    name: o.customer_name,
    phone: o.phone,
    address: o.address,
    orders_count: 1,
    total_spent: Number(o.total_amount) || 0
  }));

  const reviews = [
    { id: 'REV-01', customer: 'তানভীর আহমেদ', product: 'Amazfit GTS 4 Smartwatch', rating: 5, comment: 'অসাধারণ পণ্য! ১ দিনের মাথায় কুমিল্লা থেকে ডেলিভারি পেয়েছি।', date: 'গতকাল' },
    { id: 'REV-02', customer: 'সুলতানা জাহান', product: 'অটো গ্যাস সেফটি ডিভাইস', rating: 5, comment: 'প্রতিটি রান্নাঘরে থাকা উচিত। খুব নিরাপদ ও ১০০% অরিজিনাল।', date: '২ দিন আগে' },
    { id: 'REV-03', customer: 'মাহমুদুর রহমান', product: 'চাকের মধু', rating: 4, comment: 'মধুর টেস্ট দারুণ, একদম খাঁটি চাকের মধু। ধন্যবাদ ড্রিম কার্ট!', date: '৪ দিন আগে' }
  ];

  const auditLogs = [
    { time: 'আজ ১২:৩০ PM', user: 'MD. Saiful Islam', event: 'অর্ডার #ORD-9482 এর স্ট্যাটাস "Processing" আপডেট করেছেন', ip: '103.114.98.12' },
    { time: 'আজ ১১:১৫ AM', user: 'Jainal Abedin', event: 'নতুন পণ্য "পোর্টেবল ব্লেন্ডার" শিটে সংরক্ষণ করেছেন', ip: '103.114.98.15' },
    { time: 'আজ ১০:০০ AM', user: 'System Sync', event: 'Google Sheets v2.5 লাইভ ব্যাকগ্রাউন্ড সিঙ্ক সফল হয়েছে', ip: 'Cloud Hook' },
    { time: 'গতকাল ৫:৪০ PM', user: 'MD. Saiful Islam', event: 'রিসেলার REQ-8472 এর ৳১,১৬৪ পে-আউট অনুমোদন করেছেন', ip: '103.114.98.12' }
  ];

  const totalSalesVal = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0) + 1485000;
  const totalBuyingVal = buying.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
  const totalCostsVal = costs.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const totalInvestVal = invest.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  const kpi = {
    total_products: products.length,
    total_orders: orders.length + 840,
    total_sellers: sellers.length,
    total_resellers: resellers.length,
    total_wholesalers: wholesalers.length,
    pending_orders: orders.filter(o => o.order_status === 'Processing' || o.order_status === 'Order Placed').length || 7,
    incomplete_orders: incompleteOrders.length,
    total_costs: totalCostsVal,
    total_buying: totalBuyingVal,
    total_invest: totalInvestVal,
    total_customers: customers.length + 420,
    live_viewers: 38,
    delivered_orders: orders.filter(o => o.order_status === 'Delivered').length + 680,
    low_stock_count: products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length,
    out_of_stock_count: products.filter(p => Number(p.stock) === 0).length,
    total_sales: totalSalesVal,
    total_profit: Math.round(totalSalesVal * 0.22),
    total_loss: 0
  };

  Object.assign(window.__adminState, {
    products, orders, incompleteOrders, categories, brands, banners, variants,
    costs, buying, invest, resellers, wholesalers, sellers, markets, workers,
    admins, couriers, onlinePayments, customers, reviews, auditLogs, offers, kpi
  });

  if (!window.__currentLandingDraft && window.getAdminLandingPages) {
    const lps = window.getAdminLandingPages();
    if (lps && lps.length > 0) window.initLandingDraft(lps[0]);
  }

  window.__adminHydratedOnce = true;
  return window.__adminState;
}

export async function renderAdminPortal(params = {}) {
  const isAuth = authStore.isAuthenticated() && authStore.isAdmin();
  const pathSub = (typeof window !== 'undefined' ? window.location.pathname : '')
    .toLowerCase()
    .replace(/^.*\/admin\/?/, '')
    .replace(/^\/+|\/+$/g, '');
  const rawSubview = params.subview || pathSub || (isAuth ? 'dashboard' : 'login');

  if (!isAuth || rawSubview === 'login') {
    return renderAdminLoginView();
  }

  const data = await hydrateAdminDataIfNeeded();
  const activeRoute = resolveAdminRoute(rawSubview);
  window.__adminState.activePage = activeRoute.pageId;
  window.__adminState.activeGroup = activeRoute.groupId;

  const userDisplayName = authStore.getUserDisplayName ? authStore.getUserDisplayName() : 'Jainal Abedin';
  const workerType = authStore.user?.worker_type || 'Master Admin';
  const workerRole = authStore.user?.role || 'Full System Access';

  // Render ONLY the requested route module (zero DOM bloat!)
  const moduleRenderMap = {
    dashboard: () => renderDashboardModule(data),
    catalog: () => renderProductCatalogModule(data),
    addproduct: () => renderAddProductModule(data),
    catbrand: () => renderCategoryBrandModule(data),
    bulk: () => renderBulkToolsModule(data),
    landing: () => renderLandingCmsModule(data),
    orders: () => renderOrdersModule(data),
    partners: () => renderPartnersModule(data),
    reports: () => renderReportsModule(data),
    inventory: () => renderInventoryModule(data),
    couriers_settings: () => renderCouriersSettingsModule({ ...data, userDisplayName, workerType }),
    others: () => renderOthersModule(data)
  };

  const renderFn = moduleRenderMap[activeRoute.module] || moduleRenderMap.dashboard;
  let activeModuleHtml = renderFn();

  // Unhide the exact target page view immediately in HTML string
  const targetMarker = `id="${activeRoute.pageId}" class="admin-page-view hidden`;
  if (activeModuleHtml.includes(targetMarker)) {
    activeModuleHtml = activeModuleHtml.replace(targetMarker, `id="${activeRoute.pageId}" class="admin-page-view`);
  }

  // Sync sidebar active item & accordion group after mount
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      document.querySelectorAll('.dc-sidebar-sub-item').forEach(btn => {
        if (btn.getAttribute('data-page') === activeRoute.pageId) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      document.querySelectorAll('.admin-sidebar-main-btn').forEach(btn => {
        if (btn.getAttribute('data-group') === activeRoute.groupId) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      const subnav = document.getElementById('subnav-' + activeRoute.groupId);
      const chevron = document.getElementById('chevron-' + activeRoute.groupId);
      if (subnav) {
        subnav.classList.remove('closed');
        subnav.style.display = 'block';
      }
      if (chevron) chevron.style.transform = 'rotate(90deg)';
    }, 0);
  }

  return `
    <div class="dc-admin-wrapper">
      ${renderSidebarAndTopbar({ ...data, userDisplayName, workerType, workerRole, activeRoute })}
          ${activeModuleHtml}
        </main>
      </div>
    </div>
  `;
}

function renderAdminLoginView() {
  const captchaNum1 = Math.floor(Math.random() * 8) + 1;
  const captchaNum2 = Math.floor(Math.random() * 8) + 1;
  const captchaSum = captchaNum1 + captchaNum2;

  return `
    <div class="dc-admin-wrapper flex items-center justify-center">
      <div class="max-w-md w-full mx-auto py-12 px-4 space-y-6">
        <div class="text-center space-y-2">
          <div class="w-16 h-16 rounded-3xl bg-emerald-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg">
            DC
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">
            মাস্টার অ্যাডমিন লগইন (Admin Login)
          </h2>
          <p class="text-xs text-slate-500">
            আপনার পদবী, ইউজার নেম ও পাসওয়ার্ড দিয়ে মাস্টার প্যানেলে প্রবেশ করুন
          </p>
        </div>

        <div class="dc-admin-card space-y-4 text-xs">
          <form id="admin-login-form" class="space-y-3.5">
            <div>
              <label class="block font-bold mb-1">Worker Type (কর্মীর পদবী) *</label>
              <select id="adm-worker-type" class="form-control text-xs w-full" required>
                <option value="Admin">Admin (মাস্টার অ্যাডমিন)</option>
                <option value="Manager">Manager (ম্যানেজার)</option>
                <option value="Staff">Staff (স্টাফ)</option>
                <option value="Order Management">Order Management (অর্ডার ডেস্ক)</option>
                <option value="Customer Support">Customer Support (গ্রাহক সেবা)</option>
                <option value="Inventory/Warehouse">Inventory/Warehouse (গুদাম)</option>
                <option value="Delivery">Delivery (ডেলিভারি)</option>
                <option value="Accountant">Accountant (হিসাবরক্ষক)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold mb-1">User Name (ব্যবহারকারীর নাম) *</label>
              <select id="adm-username" class="form-control text-xs w-full" required>
                <option value="Jainal Abedin">Jainal Abedin (CEO & Lead)</option>
                <option value="MD. Saiful Islam">MD. Saiful Islam (Admin)</option>
                <option value="Admin Staff">Admin Staff (Operations)</option>
                <option value="Accounts Officer">Accounts Officer</option>
              </select>
            </div>

            <div>
              <label class="block font-bold mb-1">Password *</label>
              <input type="password" id="adm-password" required placeholder="••••••••" value="admin123" class="form-control text-xs w-full font-mono" />
            </div>

            <div class="p-3 bg-slate-50 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold">নিরাপত্তা ক্যাপচা যাচাই:</span>
                <button type="button" class="text-[11px] text-emerald-600 font-bold hover:underline" onclick="window.regenerateAdminCaptcha && window.regenerateAdminCaptcha()">
                  ক্যাপচা পরিবর্তন 🔄
                </button>
              </div>
              <div class="flex items-center gap-3">
                <div id="adm-captcha-display" class="px-3.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl font-mono text-sm font-black text-emerald-600">
                  ${captchaNum1} + ${captchaNum2} = ?
                </div>
                <input type="hidden" id="adm-captcha-expected" value="${captchaSum}" />
                <input type="number" id="adm-captcha-input" required placeholder="যোগফল লিখুন" class="form-control text-xs flex-1 font-bold" />
              </div>
            </div>

            <button type="submit" class="btn-primary w-full py-3 text-xs font-bold">
              লগইন করুন →
            </button>
          </form>

          <div class="pt-3 border-t text-center text-xs text-slate-400">
            ডেমো পাসওয়ার্ড: <span class="font-mono font-bold text-emerald-600">admin123</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export const AdminPortal = renderAdminPortal;
export default renderAdminPortal;
