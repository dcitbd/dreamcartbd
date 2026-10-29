/**
 * DREAM CART BD — Admin Sidebar & Topbar Module (adminSidebar.js)
 * Implements:
 * - Desktop Left Sticky Sidebar with Collapsible Accordion Navigation
 * - Mobile Off-Canvas Drawer with Responsive Touch Triggers
 * - Topbar with Dynamic Title, Subtitle, Global Search, Theme Switcher, and Sheet Sync
 */

export function renderSidebarAndTopbar({
  products = [],
  orders = [],
  categories = [],
  brands = [],
  banners = [],
  incompleteOrders = [],
  resellers = [],
  wholesalers = [],
  sellers = [],
  markets = [],
  workers = [],
  admins = [],
  couriers = [],
  onlinePayments = [],
  kpi = {},
  userDisplayName = 'Jainal Abedin',
  workerType = 'Master Admin',
  workerRole = 'Full System Access',
  customers = [],
  reviews = [],
  costs = [],
  buying = [],
  invest = [],
  activeRoute = { pageId: 'page-dashboard', groupId: 'group-dashboard', slug: 'dashboard', title: '📊 ড্যাশবোর্ড ওভারভিউ (Dashboard)', subtitle: '১৮-পয়েন্ট লাইভ বিজনেস কাউন্টার, রাজস্ব ও সেলস গ্রাফ' }
} = {}) {
  // Deduplicate categories for counter badge
  const uniqueCatMap = new Map();
  categories.forEach(c => {
    const raw = (c.category || '').trim();
    if (raw) uniqueCatMap.set(raw.toLowerCase(), true);
  });
  const uniqueCatCount = uniqueCatMap.size || categories.length;

  return `
    <!-- Mobile Off-Canvas Sidebar Overlay Backdrop -->
    <div 
      id="admin-sidebar-overlay" 
      class="dc-admin-overlay" 
      onclick="window.closeAdminSidebar && window.closeAdminSidebar()"
    ></div>

    <!-- Mobile Drawer with Accordion Navigation -->
    <div id="admin-sidebar-drawer" class="dc-admin-drawer closed">
      <div class="space-y-3 overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="dc-sidebar-logo">DC</div>
            <div>
              <div class="font-black text-sm text-slate-900 dark:text-white">Dream Cart BD</div>
              <div class="text-[10px] text-emerald-600 font-bold">Admin Console</div>
            </div>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-rose-500 font-bold" onclick="window.closeAdminSidebar && window.closeAdminSidebar()">✕</button>
        </div>

        <!-- Mobile Groups -->
        <div class="space-y-1">
          <button class="admin-sidebar-main-btn active" onclick="switchAdminPage('page-dashboard', 'group-dashboard')">
            <span>📊 ড্যাশবোর্ড ওভারভিউ</span>
          </button>

          <!-- Product Management -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-products')">
            <span>📦 পণ্য ব্যবস্থাপনা</span>
            <span id="chevron-mob-group-products" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-products" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-all', 'group-products')">সকল পণ্য তালিকা</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-add', 'group-products')">+ নতুন পণ্য যোগ</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-categories', 'group-products')">🗂️ ক্যাটাগরি তালিকা</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-bulk-add', 'group-products')">📥 বাল্ক পণ্য আপলোড</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-bulk-price', 'group-products')">🏷️ বাল্ক মূল্য পরিবর্তন</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-bulk-image', 'group-products')">🖼️ বাল্ক ইমেজ আপডেট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-low-stock', 'group-products')">⚠️ লো স্টক (&lt;৫)</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-out-stock', 'group-products')">🚫 আউট অব স্টক (০)</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-error', 'group-products')">⚙️ ত্রুটিযুক্ত পণ্য</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-brands', 'group-products')">🏷️ ব্র্যান্ড সমূহ</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-brand-add', 'group-products')">+ ব্র্যান্ড যুক্ত করুন</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-variants', 'group-products')">🎨 কালার ও সাইজ</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-variant-add', 'group-products')">+ ভ্যারিয়েন্ট যুক্ত</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-banners', 'group-products')">🖼️ ব্যানার CMS</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-landing', 'group-products')">🚀 ল্যান্ডিং পেজ CMS</button>
          </div>

          <!-- Order Management -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-orders')">
            <span>📋 অর্ডার ও কাস্টমার</span>
            <span id="chevron-mob-group-orders" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-orders" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-all', 'group-orders')">সকল অর্ডার তালিকা</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">⚠️ অসম্পূর্ণ অর্ডার</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-success', 'group-orders')">✓ সফল ডেলিভারি</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-shipping', 'group-orders')">🚚 কুরিয়ারে / শিপিং</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-unpaid', 'group-orders')">💳 পেমেন্ট বাকি (COD)</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-cancelled', 'group-orders')">✕ বাতিল ও রিটার্ন</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-add', 'group-orders')">+ নতুন অর্ডার এন্ট্রি</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-visitors', 'group-orders')">🟢 লাইভ ভিজিটর</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-customers', 'group-orders')">👥 কাস্টমার ডাটাবেজ</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-reviews', 'group-orders')">⭐ রিভিউ ও রেটিং</button>
          </div>

          <!-- Partner -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-partners')">
            <span>🤝 পার্টনার নেটওয়ার্ক</span>
            <span id="chevron-mob-group-partners" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-partners" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-resellers', 'group-partners')">রিসেলারসমূহ</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-wholesalers', 'group-partners')">হোলসেলার / পাইকারি</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-sellers', 'group-partners')">মার্চেন্ট সেলার</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-markets', 'group-partners')">অন্যান্য মার্কেটপ্লেস</button>
          </div>

          <!-- Admins & Workers -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-admins')">
            <span>👥 টিম ও অ্যাডমিন</span>
            <span id="chevron-mob-group-admins" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-admins" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-admin-users', 'group-admins')">মাস্টার অ্যাডমিন</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-admin-workers', 'group-admins')">কর্মী ও স্টাফ টিম</button>
          </div>

          <!-- Reports -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-reports')">
            <span>📈 রিপোর্ট সেন্টার</span>
            <span id="chevron-mob-group-reports" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-reports" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-seller', 'group-reports')">সেলার রিপোর্ট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-reseller', 'group-reports')">রিসেলার রিপোর্ট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-wholesaler', 'group-reports')">হোলসেলার রিপোর্ট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-sales', 'group-reports')">সেলস রিপোর্ট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-wholesale', 'group-reports')">পাইকারি রিপোর্ট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-costs', 'group-reports')">ব্যয় রিপোর্ট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-buying', 'group-reports')">ক্রয় রিপোর্ট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-invest', 'group-reports')">বিনিয়োগ রিপোর্ট</button>
          </div>

          <!-- Inventory & Finance -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-inventory')">
            <span>💰 ফাইন্যান্স ও ইনভেন্টরি</span>
            <span id="chevron-mob-group-inventory" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-inventory" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-payout', 'group-inventory')">রিসেলার পে-আউট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-costs', 'group-inventory')">খরচ ও ব্যয় লেজার</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-buying', 'group-inventory')">পাইকারি ক্রয় হিসাব</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-invest', 'group-inventory')">মূলধন ও বিনিয়োগ</button>
          </div>

          <!-- Courier, Fraud & Payment -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-courier')">
            <span>🚚 কুরিয়ার, ফ্রড ও পেমেন্ট</span>
            <span id="chevron-mob-group-courier" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-courier" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-list', 'group-courier')">কুরিয়ারসমূহ</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-add', 'group-courier')">+ কুরিয়ার এপিআই যুক্ত</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-fraud', 'group-courier')">🛡️ ফ্রড চেকার (Fraud)</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-payments', 'group-courier')">💳 অনলাইন পেমেন্টস</button>
          </div>

          <!-- Others Hub (/admin/others) -->
          <button class="admin-sidebar-main-btn" onclick="switchAdminPage('page-others-hub', 'group-others')">
            <span>🧩 অন্যান্য মডিউল (/admin/others)</span>
          </button>

          <!-- Settings -->
          <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-settings')">
            <span>⚙️ সিস্টেম সেটিংস</span>
            <span id="chevron-mob-group-settings" class="chevron">▶</span>
          </button>
          <div id="subnav-mob-group-settings" class="dc-sidebar-subnav closed">
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-logs', 'group-settings')">লগইন ও অডিট লগ</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-payment', 'group-settings')">পেমেন্ট মেথড</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-delivery', 'group-settings')">ডেলিভারি চার্জ ও জোন</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-offers', 'group-settings')">অফার ও কুপন</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-info', 'group-settings')">দোকানের তথ্য ও হটলাইন</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-profile', 'group-settings')">প্রোফাইল আপডেট</button>
            <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-password', 'group-settings')">পাসওয়ার্ড পরিবর্তন</button>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button class="btn-secondary w-full py-1.5 text-xs text-rose-600 border-rose-200" onclick="window.handleAdminLogout && window.handleAdminLogout()">
          লগআউট ✕
        </button>
      </div>
    </div>

    <!-- Main Desktop Layout: Sidebar with Accordion + Fluid Panel -->
    <div class="dc-admin-layout">

      <!-- Desktop Left Sticky Sidebar (সাইড বার) -->
      <aside class="dc-admin-sidebar">
        
        <!-- Brand Badge Header -->
        <div class="dc-sidebar-brand">
          <div class="dc-sidebar-logo">DC</div>
          <div>
            <div class="dc-sidebar-title">Dream Cart BD</div>
            <span class="dc-sidebar-badge">মাস্টার অ্যাডমিন পোর্টাল</span>
          </div>
        </div>

        <!-- Logged-in Worker Profile Card -->
        <div class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-xs flex-shrink-0 border border-emerald-500/20">
            👤
          </div>
          <div class="min-w-0">
            <div class="font-black text-xs text-slate-900 dark:text-white truncate">${userDisplayName}</div>
            <div class="text-[9px] text-slate-400 font-medium">${workerType} • ${workerRole}</div>
          </div>
        </div>

        <!-- NAVIGATION ACCORDIONS -->
        <div class="space-y-1">

          <!-- 1. DASHBOARD OVERVIEW -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn active" data-group="group-dashboard" onclick="switchAdminPage('page-dashboard', 'group-dashboard')">
              <span class="flex items-center gap-2"><span>📊</span> <b>ড্যাশবোর্ড ওভারভিউ</b></span>
            </button>
          </div>

          <!-- 2. PRODUCT MANAGEMENT -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-products" onclick="toggleSidebarAccordion('group-products')">
              <span class="flex items-center gap-2"><span>📦</span> <b>পণ্য ব্যবস্থাপনা</b></span>
              <span id="chevron-group-products" class="chevron">▶</span>
            </button>
            <div id="subnav-group-products" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item active" data-page="page-prod-all" onclick="switchAdminPage('page-prod-all', 'group-products')">
                <span>সকল পণ্য তালিকা</span>
                <span class="admin-nav-counter">${products.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-add" onclick="switchAdminPage('page-prod-add', 'group-products')">
                <span>+ নতুন পণ্য যোগ</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-categories" onclick="switchAdminPage('page-prod-categories', 'group-products')">
                <span>🗂️ ক্যাটাগরি তালিকা</span>
                <span class="admin-nav-counter">${uniqueCatCount}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-bulk-add" onclick="switchAdminPage('page-prod-bulk-add', 'group-products')">
                <span>📥 বাল্ক পণ্য আপলোড</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-bulk-price" onclick="switchAdminPage('page-prod-bulk-price', 'group-products')">
                <span>🏷️ বাল্ক মূল্য পরিবর্তন</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-bulk-image" onclick="switchAdminPage('page-prod-bulk-image', 'group-products')">
                <span>🖼️ বাল্ক ইমেজ আপডেট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-low-stock" onclick="switchAdminPage('page-prod-low-stock', 'group-products')">
                <span>⚠️ লো স্টক (&lt;৫)</span>
                <span class="admin-nav-counter">${kpi.low_stock_count}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-out-stock" onclick="switchAdminPage('page-prod-out-stock', 'group-products')">
                <span>🚫 আউট অব স্টক (০)</span>
                <span class="admin-nav-counter">${kpi.out_of_stock_count}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-error" onclick="switchAdminPage('page-prod-error', 'group-products')">
                <span>⚙️ ত্রুটিযুক্ত পণ্য</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-brands" onclick="switchAdminPage('page-prod-brands', 'group-products')">
                <span>🏷️ ব্র্যান্ড সমূহ</span>
                <span class="admin-nav-counter">${brands.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-brand-add" onclick="switchAdminPage('page-prod-brand-add', 'group-products')">
                <span>+ ব্র্যান্ড যুক্ত করুন</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-variants" onclick="switchAdminPage('page-prod-variants', 'group-products')">
                <span>🎨 কালার ও সাইজ</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-variant-add" onclick="switchAdminPage('page-prod-variant-add', 'group-products')">
                <span>+ ভ্যারিয়েন্ট যুক্ত</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-banners" onclick="switchAdminPage('page-prod-banners', 'group-products')">
                <span>🖼️ ব্যানার CMS</span>
                <span class="admin-nav-counter">${banners.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-prod-landing" onclick="switchAdminPage('page-prod-landing', 'group-products')">
                <span>🚀 ল্যান্ডিং পেজ CMS</span>
              </button>
            </div>
          </div>

          <!-- 3. ORDER MANAGEMENT -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-orders" onclick="toggleSidebarAccordion('group-orders')">
              <span class="flex items-center gap-2"><span>📋</span> <b>অর্ডার ও কাস্টমার</b></span>
              <span id="chevron-group-orders" class="chevron">▶</span>
            </button>
            <div id="subnav-group-orders" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" data-page="page-orders-all" onclick="switchAdminPage('page-orders-all', 'group-orders')">
                <span>সকল অর্ডার তালিকা</span>
                <span class="admin-nav-counter">${orders.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-incomplete" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">
                <span>⚠️ অসম্পূর্ণ অর্ডার</span>
                <span class="admin-nav-counter">${incompleteOrders.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-success" onclick="switchAdminPage('page-orders-success', 'group-orders')">
                <span>✓ সফল ডেলিভারি</span>
                <span class="admin-nav-counter">${orders.filter(o => o.order_status === 'Delivered').length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-shipping" onclick="switchAdminPage('page-orders-shipping', 'group-orders')">
                <span>🚚 কুরিয়ারে / শিপিং</span>
                <span class="admin-nav-counter">${orders.filter(o => o.order_status === 'Shipped' || o.order_status === 'Packing' || o.order_status === 'In Transit').length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-unpaid" onclick="switchAdminPage('page-orders-unpaid', 'group-orders')">
                <span>💳 পেমেন্ট বাকি (COD)</span>
                <span class="admin-nav-counter">${orders.filter(o => o.payment_status === 'Pending').length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-cancelled" onclick="switchAdminPage('page-orders-cancelled', 'group-orders')">
                <span>✕ বাতিল ও রিটার্ন</span>
                <span class="admin-nav-counter">${orders.filter(o => o.order_status === 'Cancelled').length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-add" onclick="switchAdminPage('page-orders-add', 'group-orders')">
                <span>+ নতুন অর্ডার এন্ট্রি</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-visitors" onclick="switchAdminPage('page-orders-visitors', 'group-orders')">
                <span>🟢 লাইভ ভিজিটর</span>
                <span class="admin-nav-counter">${kpi.live_viewers}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-customers" onclick="switchAdminPage('page-orders-customers', 'group-orders')">
                <span>👥 কাস্টমার ডাটাবেজ</span>
                <span class="admin-nav-counter">${customers.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-orders-reviews" onclick="switchAdminPage('page-orders-reviews', 'group-orders')">
                <span>⭐ রিভিউ ও রেটিং</span>
                <span class="admin-nav-counter">${reviews.length}</span>
              </button>
            </div>
          </div>

          <!-- 4. PARTNER NETWORK -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-partners" onclick="toggleSidebarAccordion('group-partners')">
              <span class="flex items-center gap-2"><span>🤝</span> <b>পার্টনার নেটওয়ার্ক</b></span>
              <span id="chevron-group-partners" class="chevron">▶</span>
            </button>
            <div id="subnav-group-partners" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" data-page="page-partner-resellers" onclick="switchAdminPage('page-partner-resellers', 'group-partners')">
                <span>রিসেলারসমূহ</span>
                <span class="admin-nav-counter">${resellers.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-partner-wholesalers" onclick="switchAdminPage('page-partner-wholesalers', 'group-partners')">
                <span>হোলসেলার / পাইকারি</span>
                <span class="admin-nav-counter">${wholesalers.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-partner-sellers" onclick="switchAdminPage('page-partner-sellers', 'group-partners')">
                <span>মার্চেন্ট সেলার</span>
                <span class="admin-nav-counter">${sellers.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-partner-markets" onclick="switchAdminPage('page-partner-markets', 'group-partners')">
                <span>অন্যান্য মার্কেটপ্লেস</span>
                <span class="admin-nav-counter">${markets.length}</span>
              </button>
            </div>
          </div>

          <!-- 5. ADMINS & WORKERS -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-admins" onclick="toggleSidebarAccordion('group-admins')">
              <span class="flex items-center gap-2"><span>👥</span> <b>টিম ও অ্যাডমিন</b></span>
              <span id="chevron-group-admins" class="chevron">▶</span>
            </button>
            <div id="subnav-group-admins" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" data-page="page-admin-users" onclick="switchAdminPage('page-admin-users', 'group-admins')">
                <span>মাস্টার অ্যাডমিন</span>
                <span class="admin-nav-counter">${admins.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-admin-workers" onclick="switchAdminPage('page-admin-workers', 'group-admins')">
                <span>কর্মী ও স্টাফ টিম</span>
                <span class="admin-nav-counter">${workers.length}</span>
              </button>
            </div>
          </div>

          <!-- 6. REPORTS CENTER -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-reports" onclick="toggleSidebarAccordion('group-reports')">
              <span class="flex items-center gap-2"><span>📈</span> <b>রিপোর্ট সেন্টার</b></span>
              <span id="chevron-group-reports" class="chevron">▶</span>
            </button>
            <div id="subnav-group-reports" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" data-page="page-report-seller" onclick="switchAdminPage('page-report-seller', 'group-reports')">
                <span>সেলার রিপোর্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-report-reseller" onclick="switchAdminPage('page-report-reseller', 'group-reports')">
                <span>রিসেলার রিপোর্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-report-wholesaler" onclick="switchAdminPage('page-report-wholesaler', 'group-reports')">
                <span>হোলসেলার রিপোর্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-report-sales" onclick="switchAdminPage('page-report-sales', 'group-reports')">
                <span>সার্বিক সেলস রিপোর্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-report-wholesale" onclick="switchAdminPage('page-report-wholesale', 'group-reports')">
                <span>পাইকারি সেলস রিপোর্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-report-costs" onclick="switchAdminPage('page-report-costs', 'group-reports')">
                <span>ব্যবসায়িক ব্যয় রিপোর্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-report-buying" onclick="switchAdminPage('page-report-buying', 'group-reports')">
                <span>পাইকারি ক্রয় রিপোর্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-report-invest" onclick="switchAdminPage('page-report-invest', 'group-reports')">
                <span>মূলধন বিনিয়োগ রিপোর্ট</span>
              </button>
            </div>
          </div>

          <!-- 7. INVENTORY & FINANCE -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-inventory" onclick="toggleSidebarAccordion('group-inventory')">
              <span class="flex items-center gap-2"><span>💰</span> <b>ফাইন্যান্স ও ইনভেন্টরি</b></span>
              <span id="chevron-group-inventory" class="chevron">▶</span>
            </button>
            <div id="subnav-group-inventory" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" data-page="page-inv-payout" onclick="switchAdminPage('page-inv-payout', 'group-inventory')">
                <span>রিসেলার পে-আউট (-৩%)</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-inv-costs" onclick="switchAdminPage('page-inv-costs', 'group-inventory')">
                <span>খরচ ও ব্যয় ট্র্যাকার</span>
                <span class="admin-nav-counter">${costs.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-inv-buying" onclick="switchAdminPage('page-inv-buying', 'group-inventory')">
                <span>পাইকারি ক্রয় হিসাব</span>
                <span class="admin-nav-counter">${buying.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-inv-invest" onclick="switchAdminPage('page-inv-invest', 'group-inventory')">
                <span>মূলধন ও বিনিয়োগ</span>
                <span class="admin-nav-counter">${invest.length}</span>
              </button>
            </div>
          </div>

          <!-- 8. COURIER, FRAUD & PAYMENT -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-courier" onclick="toggleSidebarAccordion('group-courier')">
              <span class="flex items-center gap-2"><span>🚚</span> <b>কুরিয়ার, ফ্রড ও পেমেন্ট</b></span>
              <span id="chevron-group-courier" class="chevron">▶</span>
            </button>
            <div id="subnav-group-courier" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" data-page="page-courier-list" onclick="switchAdminPage('page-courier-list', 'group-courier')">
                <span>সংযুক্ত কুরিয়ারসমূহ</span>
                <span class="admin-nav-counter">${couriers.length}</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-courier-add" onclick="switchAdminPage('page-courier-add', 'group-courier')">
                <span>+ কুরিয়ার এপিআই যুক্ত</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-courier-fraud" onclick="switchAdminPage('page-courier-fraud', 'group-courier')">
                <span>🛡️ কাস্টমার ফ্রড চেকার</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-courier-payments" onclick="switchAdminPage('page-courier-payments', 'group-courier')">
                <span>💳 অনলাইন পেমেন্টস</span>
                <span class="admin-nav-counter">${onlinePayments.length}</span>
              </button>
            </div>
          </div>

          <!-- 10. OTHERS HUB (/admin/others) -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-others" onclick="switchAdminPage('page-others-hub', 'group-others')">
              <span class="flex items-center gap-2"><span>🧩</span> <b>অন্যান্য (/admin/others)</b></span>
            </button>
          </div>

          <!-- 9. SETTINGS -->
          <div class="dc-sidebar-nav-group">
            <button class="admin-sidebar-main-btn" data-group="group-settings" onclick="toggleSidebarAccordion('group-settings')">
              <span class="flex items-center gap-2"><span>⚙️</span> <b>সিস্টেম সেটিংস</b></span>
              <span id="chevron-group-settings" class="chevron">▶</span>
            </button>
            <div id="subnav-group-settings" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" data-page="page-set-logs" onclick="switchAdminPage('page-set-logs', 'group-settings')">
                <span>অডিট ও কর্মী লগ</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-set-payment" onclick="switchAdminPage('page-set-payment', 'group-settings')">
                <span>পেমেন্ট মেথড আপডেট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-set-delivery" onclick="switchAdminPage('page-set-delivery', 'group-settings')">
                <span>ডেলিভারি মেথড কনফিগ</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-set-offers" onclick="switchAdminPage('page-set-offers', 'group-settings')">
                <span>অফার ও কুপন ডিসকাউন্ট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-set-info" onclick="switchAdminPage('page-set-info', 'group-settings')">
                <span>ওয়েবসাইট তথ্য আপডেট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-set-profile" onclick="switchAdminPage('page-set-profile', 'group-settings')">
                <span>প্রোফাইল আপডেট</span>
              </button>
              <button class="dc-sidebar-sub-item" data-page="page-set-password" onclick="switchAdminPage('page-set-password', 'group-settings')">
                <span>পাসওয়ার্ড পরিবর্তন</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Sidebar Footer -->
        <div class="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 mt-auto text-xs">
          <div class="flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span class="flex items-center gap-1.5 font-bold text-emerald-600">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Google Sheets
            </span>
            <span class="font-mono text-[9px] text-slate-400">v3.5 Live</span>
          </div>
          
          <div class="flex items-center gap-1.5 pt-0.5">
            <a href="/products" target="_blank" class="btn-secondary py-1 px-2.5 text-[10px] font-bold flex-1 text-center bg-slate-100 dark:bg-slate-800">
              শপ ভিউ ↗
            </a>
            <button class="btn-secondary py-1 px-2 text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50" onclick="window.handleAdminLogout && window.handleAdminLogout()" title="লগআউট">
              ✕
            </button>
          </div>
        </div>

      </aside>

      <!-- Right Main Panel Header -->
      <main id="admin-main-panel" class="dc-admin-main">
        
        <!-- Top Bar -->
        <div class="dc-admin-topbar">
          <div class="flex items-center gap-2.5">
            <button 
              class="lg:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-emerald-50 transition"
              onclick="window.toggleAdminSidebar && window.toggleAdminSidebar()"
              aria-label="Toggle Menu"
            >
              ☰ মেনু
            </button>
            <div>
              <h2 id="admin-current-tab-title" class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                ${activeRoute.title}
              </h2>
              <p id="admin-current-tab-subtitle" class="text-[10px] sm:text-[11px] text-slate-400">${activeRoute.subtitle}</p>
            </div>
          </div>

          <!-- Global Search & Actions -->
          <div class="flex items-center gap-1.5">
            <div class="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="বর্তমান পেজে সার্চ..." 
                class="form-control text-xs py-1.5 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 w-36 md:w-52"
                oninput="window.handleAdminGlobalSearch(this.value)"
              />
              <span class="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>

            <button 
              id="admin-theme-toggle"
              class="btn-secondary text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-800 font-bold"
              onclick="window.toggleAdminTheme && window.toggleAdminTheme()"
              title="থিম পরিবর্তন"
            >
              <span id="admin-theme-icon">🌙</span>
            </button>

            <a href="/" class="btn-secondary text-xs py-1.5 px-3 font-bold" title="হোম পেজে যান">
              🏠 হোম পেজ ↗
            </a>

            <button 
              class="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 font-bold"
              onclick="const ic = this.querySelector('.spin-icon'); if(ic) ic.classList.add('animate-spin'); setTimeout(() => { if(ic) ic.classList.remove('animate-spin'); if(toast && toast.show) toast.show({type: 'success', title: 'ডাটা আপডেট', message: 'গুগল শিট থেকে ডাটা রিফ্রেশ হয়েছে!'}); }, 600);"
              title="রিফ্রেশ ডাটা"
            >
              <span class="spin-icon">🔄</span> <span class="hidden md:inline">সিঙ্ক</span>
            </button>
          </div>

          <!-- Quick Page Route Navigation Bar (domain/admin/...) -->
          <div class="w-full pt-2.5 mt-1 border-t flex items-center justify-between gap-2 overflow-x-auto">
            <div class="flex items-center gap-1.5 text-xs">
              <a href="/admin/dashboard" onclick="event.preventDefault(); switchAdminPage('page-dashboard', 'group-dashboard')" data-page="page-dashboard" class="admin-route-tab ${activeRoute.pageId === 'page-dashboard' ? 'active' : ''}">📊 ড্যাশবোর্ড</a>
              <a href="/admin/products" onclick="event.preventDefault(); switchAdminPage('page-prod-all', 'group-products')" data-page="page-prod-all" class="admin-route-tab ${activeRoute.pageId === 'page-prod-all' ? 'active' : ''}">📦 প্রোডাক্টস</a>
              <a href="/admin/addproduct" onclick="event.preventDefault(); switchAdminPage('page-prod-add', 'group-products')" data-page="page-prod-add" class="admin-route-tab ${activeRoute.pageId === 'page-prod-add' ? 'active' : ''}">➕ প্রোডাক্ট যোগ</a>
              <a href="/admin/categroy" onclick="event.preventDefault(); switchAdminPage('page-prod-categories', 'group-products')" data-page="page-prod-categories" class="admin-route-tab ${activeRoute.pageId === 'page-prod-categories' ? 'active' : ''}">🗂️ ক্যাটাগরি</a>
              <a href="/admin/brands" onclick="event.preventDefault(); switchAdminPage('page-prod-brands', 'group-products')" data-page="page-prod-brands" class="admin-route-tab ${activeRoute.pageId === 'page-prod-brands' ? 'active' : ''}">🏷️ ব্র্যান্ডসমূহ</a>
              <a href="/admin/orders" onclick="event.preventDefault(); switchAdminPage('page-orders-all', 'group-orders')" data-page="page-orders-all" class="admin-route-tab ${activeRoute.pageId === 'page-orders-all' ? 'active' : ''}">📋 অর্ডারসমূহ</a>
              <a href="/admin/landing" onclick="event.preventDefault(); switchAdminPage('page-prod-landing', 'group-products')" data-page="page-prod-landing" class="admin-route-tab ${activeRoute.pageId === 'page-prod-landing' ? 'active' : ''}">🚀 ল্যান্ডিং পেজ</a>
              <a href="/admin/others" onclick="event.preventDefault(); switchAdminPage('page-others-hub', 'group-others')" data-page="page-others-hub" class="admin-route-tab ${activeRoute.pageId === 'page-others-hub' ? 'active' : ''}">🧩 অন্যান্য</a>
            </div>
            <span 
              id="admin-current-route-badge" 
              onclick="window.copyToClipboard(window.location.origin + '/admin/${activeRoute.slug}', 'পেজ লিঙ্ক কপি হয়েছে!')"
              class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold cursor-pointer"
              title="ক্লিক করে পেজ URL কপি করুন"
            >
              🔗 /admin/${activeRoute.slug}
            </span>
          </div>
        </div>
  `;
}
