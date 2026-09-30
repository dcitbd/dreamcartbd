# Dream Cart BD — Full Multi-Vendor E-Commerce System

An enterprise-grade, high-reliability, 4-layer multi-vendor digital commerce platform built for the Bangladesh market.

---

## 🌟 Architectural Overview

```
[CUSTOMER / ADMIN / SELLER / RESELLER / WHOLESALER UI]
                       ↓
  [GitHub Hosted Frontend — Vite SPA + Tailwind CSS]
                       ↓
  [Google Apps Script Server-Side API Gateway]
                       ↓
[Google Sheets Database (92+ Sheets) + Google Drive Media]
```

### Core Separation of Concerns:
1. **Frontend**: Pure Presentation, Client State, Routing, and User Interaction. Never reads/writes to Google Sheets directly.
2. **Apps Script API Gateway**: Business Logic, Server-Side Authentication, RBAC, Data Validation, LockService Concurrency, and External APIs (bKash/Nagad/Steadfast).
3. **Google Sheets Database**: Central transactional ledger, inventory balances, audit logs, and operational data (`19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc`).
4. **Google Drive**: Media storage for original images, WebP assets, attachments, PDF invoices, and automated database backups.

---

## 🚀 Key Features Implemented

### 1. Extraordinary Design System & UI/UX
- **Modern Color Palette**: Emerald Green (`#059669`), Deep Slate (`#0f172a`), Amber Gold (`#f59e0b`), and clean whites.
- **Glassmorphic Elements**: Frosted navigation headers, translucent cards, and smooth backdrop-blur effects.
- **Extraordinary Notification & Toast System**: Dynamic sliding toast notifications with progress countdown bars, custom status icons, sound-simulation animations, and action triggers.
- **Modern Form Elements**: Floating label inputs, automatic Bangladesh phone number validation (`+8801XXXXXXXXX`), responsive focus rings, and real-time calculation.
- **Micro-Interactions**: Hover lifts on buttons, badge pulses, ripple effects, and skeleton shimmer loaders.

### 2. Multi-Vendor Architecture
- **Product Master vs. Seller Offer**: A single unified catalog product can be supplied by multiple independent sellers with distinct prices, stock allocations, and commission rates.
- **Master Order & Sub-Orders**: When a customer places an order containing items from multiple vendors, the system creates one Master Order (`ORD-XXXXX`) and automatically splits it into vendor-specific Sub-Orders (`ORD-XXXXX-S1`, `ORD-XXXXX-S2`).
- **Vendor Data Isolation**: Sellers have restricted access strictly scoped to their own sub-orders, products, earnings, and store balance.

### 3. Inventory Control & Concurrency
- **4-Tier Inventory**: `AVAILABLE = PHYSICAL - RESERVED - DAMAGED`.
- **Atomic Reservation**: Uses Google Apps Script `LockService.getScriptLock()` to lock rows during checkout, preventing overselling or race conditions when two customers order the last unit simultaneously.

### 4. Courier & Fraud Defense Center
- **Multi-Courier Intelligence**: Live aggregator interface checking customer phone delivery history across **Steadfast Courier**, **Pathao Courier**, and **RedX**.
- **Algorithmic Risk Scoring**: Calculates return rate (RTO), delivery completion percentage, order velocity, and issues automated COD warnings.

### 5. Partner Portals
- **Marketplace Seller**: Application onboarding, store profile, stock management, order fulfillment, and weekly withdrawals.
- **Dropshipping Reseller**: Catalog with pre-negotiated wholesale margins and custom resale pricing.
- **Wholesale Bulk Orders**: Master carton tier pricing, minimum order quantities (MOQ), and statement ledgers.

---

## 🛠️ Quick Start & Deployment Guide

### A. Google Apps Script Backend Deployment
1. Open your target Google Spreadsheet: [Dream Cart BD Master Sheet](https://docs.google.com/spreadsheets/d/19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc/edit)
2. Go to **Extensions** → **Apps Script**.
3. You can either copy each file from `apps-script/` or paste the single combined file `apps-script/Code_Combined.js` directly into the editor.
4. Verify `appsscript.json` includes `"runtimeVersion": "V8"`.
5. Click **Deploy** → **New Deployment**.
   - Select type: **Web app**
   - Execute as: **Me (your Google Account)**
   - Who has access: **Anyone**
6. Click **Deploy** and copy your **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).

### B. Frontend Deployment on GitHub Pages
1. Push this repository to GitHub (`dreamcartbd`).
2. Update `.env` or `src/api/client.js` with your Google Apps Script Web App URL:
   ```bash
   VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```
3. Go to **Settings** → **Pages** on your GitHub repository.
4. Set Source to **GitHub Actions**. The included `.github/workflows/deploy.yml` will automatically build and publish your site with zero manual setup.
5. (Optional) Connect your custom domain (e.g. `dreamcartbd.com`) in GitHub Pages settings.

---

## 📁 Repository Structure
```
dreamcartbd/
├── .github/workflows/deploy.yml
├── apps-script/
│   ├── Config.js
│   ├── IDGenerator.js
│   ├── LockService.js
│   ├── Validator.js
│   ├── SheetRepository.js
│   ├── DriveRepository.js
│   ├── CacheService.js
│   ├── AuditService.js
│   ├── AuthService.js
│   ├── ProductService.js
│   ├── InventoryService.js
│   ├── OrderService.js
│   ├── CourierFraudService.js
│   ├── PartnerServices.js
│   ├── OtherServices.js
│   ├── Router.js
│   ├── Code.js
│   ├── Code_Combined.js
│   ├── SheetTriggers.js
│   └── appsscript.json
├── src/
│   ├── api/client.js
│   ├── components/
│   │   ├── Toast.js
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── MobileNav.js
│   │   ├── ProductCard.js
│   │   ├── CartDrawer.js
│   │   └── FraudModal.js
│   ├── pages/
│   │   ├── storefront/
│   │   │   ├── HomePage.js
│   │   │   ├── ShopPage.js
│   │   │   ├── ProductDetailPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── OrderSuccessPage.js
│   │   │   └── TrackOrderPage.js
│   │   ├── admin/AdminPortal.js
│   │   └── partner/PartnerPortal.js
│   ├── store/
│   │   ├── cartStore.js
│   │   └── authStore.js
│   ├── styles/main.css
│   ├── utils/format.js
│   ├── router.js
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```
