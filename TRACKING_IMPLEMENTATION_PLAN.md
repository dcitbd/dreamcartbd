# Dream Cart BD — Tracking, Conversion API & Admin Dashboard Implementation Plan

**Project:** Dream Cart BD (`https://dreamcartbd.com`)  
**Date Prepared:** 2026-11-24  
**Phase:** Phase A — Discovery, Baseline Audit & Change-Control Plan  
**Status:** Awaiting Owner Approval Before Modifying Any Existing File  

---

## 1. Mandatory Discovery Report (Repository & Environment Audit)

### 1.1 Repository Structure & Version Baseline
- **Source Archive Verified:** `dreamcartbd-main.zip` (identical to `dreamcartbd-main (1).zip`, SHA-256: `e9a61d14742b9ddf187ceb3a2e12cd5e92507f7083712d0d287e043147333c7c`).
- **Backup Checkpoint Created:** Full untouched backup saved before any work.
- **Git Metadata:** No `.git` directory is present inside the uploaded archive; application version is `2.5.0` (`package.json`) and PHP backend version is `5.6.0-LIVE-WEB-TURBO` (`includes/config.php`).
- **Total Files:** 416 files (~8.5 MB total).

### 1.2 Frontend Entry Points & Shared Layout
- **Static / Vite Entry:** `index.html` (26 KB) loads `./src/styles/main.css` (66 KB), `./src/styles/admin.css` (48 KB), `./src/styles/responsive.css` (3.4 KB), and ES module `./src/main.js` (60 KB).
- **PHP SSR Entry:** `includes/bootstrap.php` (8 KB) renders dynamic SEO/OpenGraph (`includes/seo_renderer.php`), injects `window.__DCBD_SSR_CACHE__`, and loads `/src/boot.js` + `/src/main.js`.
- **Shared Chrome:** `src/main.js` mounts `#header-mount`, `#app-content`, `#footer-mount`, `#floatingactions-mount`, `#mobilenav-mount`, `#cartdrawer-mount`, and `#fraudmodal-mount`.
- **SPA Clean-Path Router:** `src/router.js` (95 KB) resolves clean URLs (`/`, `/products`, `/product/:slug`, `/cart`, `/checkout`, `/order-success`, `/track`, `/contact`, `/privacy`, `/customer/*`, `/reseller/*`, `/wholesaler/*`, `/admin/*`).

### 1.3 E-Commerce Flows Inspected
| Flow | Implementation Location | Notes |
|---|---|---|
| **Product Catalog & Detail** | `api/index.php?action=products/list`, `src/pages/storefront/ShopPage.js`, `ProductDetailPage.js` | Data cached in SQLite/JSON (`dcbd_sheet_products`) synced with Google Sheets (`Products` tab). Currency: `BDT`. |
| **Search Flow** | `src/main.js` (`#global-search-input`, `#mobile-search-input`) + `src/utils/marketingPixels.js` (`SearchService`) | Supports English, Bengali, and Banglish queries; navigates to `/products?search=...`. |
| **Add / Remove / Update Cart** | `src/store/cartStore.js` + delegated handlers in `src/main.js` | Supports variants (color/size), wholesale MOQ, pre-order (+15%, online payment only), delivery zones, and coupons. |
| **Checkout & Validation** | `src/pages/storefront/CheckoutPage.js`, `src/main.js` (`#checkout-form`, `#landing-order-form`) | Captures name, phone, address, delivery zone, payment method, TrxID (for online payments), and incomplete order leads. |
| **Order Creation (Authoritative)** | `api/index.php` (`case 'orders/create'`) | Normalizes order, writes to cache, flushes JSON in `<5ms` via `dcbd_flush_json_and_continue_background()`, then syncs Google Sheets in background. |
| **Payment & Verification** | Manual COD (`Pending`), bKash/Nagad/Rocket/Bank TrxID, bKash Payment Link; admin verifies via `orders/update_status` | No automated payment gateway webhook exists yet. COD placement must be distinguished from verified payment. |
| **Order Confirmation** | `src/pages/storefront/OrderSuccessPage.js` (`/order-success?orderId=...`) | Displays invoice voucher & barcode; page refresh must not re-fire `purchase`. |
| **Customer / Partner / Admin Auth** | `src/main.js`, `src/store/authStore.js`, `src/utils/security.js` | Client-side signed tokens + SHA-256 hashes; Admin Portal in `src/pages/admin/AdminPortal.js` + `modules/`. |
| **Privacy Policy** | `src/pages/storefront/PrivacyPage.js` | 12 groups / 16 clauses in Bengali; requires an optional addendum describing tracking providers & user consent choices. |

### 1.4 Existing Tracking & Security Audit Findings
1. **Existing Pixel Code:** `includes/pixel_tracker.php` (17 KB) and `src/utils/marketingPixels.js` (90 KB) already contain partial Meta Pixel, GTM, gtag, TikTok Pixel, and a basic Meta CAPI call.
2. **Identified Gaps:**
   - Meta CAPI currently targets outdated Graph API **`v19.0`** (current official version is **`v27.0`**).
   - No durable queue, retry/backoff, locking, or dead-letter handling; failures are silently dropped.
   - Missing **GA4 Measurement Protocol**, **TikTok Events API v1.3**, **Google Ads Enhanced Conversions consent gating**, **Microsoft Clarity**, and an extensible adapter registry.
   - **Security Risk:** `fbCapiToken` is currently stored inside `dcbd_site_settings` and exposed in `localStorage` / admin settings JS (`src/api/client.js`, `adminCouriersSettings.js`). Secrets must be stored server-side only (encrypted at rest) and masked in UI.
   - **Order Integrity Risk:** `marketingPixels.js` currently sends browser-side `Purchase` payloads directly to `pixels/track`, trusting client-supplied totals.
   - No Consent Management state/storage or dedicated `/admin/tracking/` dashboard.

### 1.5 Hosting & Deployment Environment
The repository contains deployment configurations for **both**:
1. **cPanel / Apache PHP Hosting:** `api/index.php`, `includes/*.php`, SQLite3 (`storage/dreamcartbd.sqlite`), PHP background flush.
2. **Static Hosting (GitHub Pages / Cloudflare Pages):** `.github/workflows/deploy.yml`, `_redirects`, `_routes.json`, `CNAME` (`dreamcartbd.com`).

> **Owner Confirmation Required:** Please confirm whether live `dreamcartbd.com` is currently hosted on **cPanel/PHP hosting** (supports PHP + SQLite3 + cron directly) or **GitHub Pages / Cloudflare Pages** (static-only, requiring a separate API subdomain such as `api.dreamcartbd.com` for server-side tracking and the admin dashboard).

---

## 2. Verified Official API Versions & Documentation (Checked: 2026-11-24)

| Platform | Protocol / Version | Official Endpoint / Script | Documentation URL |
|---|---|---|---|
| **Meta Pixel & Conversions API** | Graph API **v27.0** | `POST https://graph.facebook.com/v27.0/{PIXEL_ID}/events` | [Meta Conversions API Docs](https://developers.facebook.com/documentation/ads-commerce/conversions-api) & [Graph API Changelog](https://developers.facebook.com/documentation/development/graph-api/changelog) |
| **Google Analytics 4 (GA4) MP** | Measurement Protocol (GA4) | `POST https://www.google-analytics.com/mp/collect` (Debug: `/debug/mp/collect`) | [GA4 Measurement Protocol Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference) & [Validating Events](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events) |
| **Google Tag Manager (GTM)** | Web Container + DataLayer | `https://www.googletagmanager.com/gtm.js?id={GTM_ID}` | [Google Tag Manager Docs](https://developers.google.com/tag-platform/tag-manager) & [Consent Mode](https://developers.google.com/tag-platform/security/guides/consent) |
| **Google Ads & Enhanced Conversions** | Google Tag (`gtag.js`) / Combined Web & Leads EC | `https://www.googletagmanager.com/gtag/js?id={AW_ID}` | [Enhanced Conversions for Web](https://support.google.com/google-ads/answer/13258081?hl=en) & [GTM Setup](https://support.google.com/google-ads/answer/13262500?hl=en) |
| **TikTok Pixel & Events API** | Business API **v1.3** (Consolidated Endpoint) | `POST https://business-api.tiktok.com/open_api/v1.3/event/track/` | [TikTok Events API v1.3 Web](https://business-api.tiktok.com/portal/docs/events-api-web/v1.3) & [Event Deduplication](https://business-api.tiktok.com/portal/docs/event-deduplication/v1.3) |
| **Microsoft Clarity** | Browser Tag + Consent API | `https://www.clarity.ms/tag/{PROJECT_ID}` | [Microsoft Clarity Setup Docs](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup) |

---

## 3. Isolated Modular Architecture (Zero Impact on Existing Website)

All new tracking code, database tables, queue workers, provider adapters, SDK, and admin dashboard live inside **brand-new isolated directories** with strict namespacing (`window.DCBDTracking`, CSS prefix `.dcbd-trk-*`, API prefix `/tracking/api/`, isolated SQLite DB `storage/tracking.sqlite`):

```text
tracking/
├── bootstrap.php              # Isolated module bootstrapper & security headers
├── config.php                 # Env loader (.env) + safe defaults
├── crypto.php                 # AES-256-GCM secret encryption & masking
├── db.php                     # Isolated SQLite3 DB (storage/tracking.sqlite) — 0 edits to existing DB
├── schema.php                 # Canonical event schema v1.0 & strict validator
├── consent.php                # Consent record storage & server-side enforcement
├── queue.php                  # Durable queue (pending/processing/delivered/failed/dead_letter)
├── worker.php                 # Cron / CLI / background processor with lease locks & backoff+jitter
├── adapters/
│   ├── AdapterInterface.php   # Contract for all platform adapters
│   ├── AdapterRegistry.php    # Pluggable registry (add Pinterest/Snapchat without core edits)
│   ├── MetaCapiAdapter.php    # Meta Conversions API v27.0 (SHA-256 PII normalization, dedup, test_event_code)
│   ├── Ga4MpAdapter.php       # GA4 Measurement Protocol (collect + /debug/mp/collect validation)
│   ├── TikTokEventsAdapter.php# TikTok Events API v1.3 (consolidated endpoint, dedup, test_event_code)
│   ├── GoogleAdsAdapter.php   # Google Ads conversion & consent-gated Enhanced Conversions prep
│   ├── PinterestAdapter.php   # Extensible stub adapter
│   └── SnapchatAdapter.php    # Extensible stub adapter
├── api/
│   ├── config.php             # Public non-secret browser config (Pixel IDs & consent defaults ONLY)
│   ├── collect.php            # First-party event collector (rate limit, origin check, size cap, non-blocking)
│   └── admin.php              # Auth + Role + CSRF protected Admin API for all 13 dashboard modules
└── sdk/
    ├── dcbd-tracking-loader.js# Ultra-light async/defer loader (<1.5 KB)
    └── dcbd-tracking.js       # Namespaced window.DCBDTracking SDK (<10 KB, passive listeners, zero DOM edits)

admin/tracking/
├── index.php                  # Standalone protected Admin Tracking Dashboard (13 modules)
├── assets/
│   ├── tracking-admin.css     # Strictly namespaced .dcbd-trk-* responsive styles
│   └── tracking-admin.js      # Real DB-backed dashboard UI (no hardcoded demo stats)
```

### Purchase & Order Integrity Rules
- **Authoritative Server Source:** `purchase` events are enqueued server-side inside `api/index.php` from the persisted order record (`order_id`, `subtotal`, `delivery_fee`, `discount`, `total_amount`, `payment_method`, `payment_status`, `order_status`).
- **Stable Deduplication ID:** `PUR_{order_id}` persisted in `dcbd_trk_orders` with a `UNIQUE(order_id, milestone)` constraint so page refreshes, retries, and duplicate callbacks never emit duplicate purchases.
- **COD vs Paid Distinction:** Configurable business rule in `/admin/tracking/` (default: `order_placed` fires `Purchase` for confirmed COD & online orders with explicit `payment_state: 'cod_pending'` vs `'payment_submitted'`, OR switchable to `verified_paid_only` so `Purchase` fires only when admin marks order Delivered/Paid). Cancelled/rejected/test/fraudulent orders are strictly blocked.
- **Value Accounting Rule:** Matches Dream Cart BD's checkout `total_amount` (`subtotal - discount + delivery_fee`) with `shipping` and `discount` passed separately to GA4/Meta/TikTok where supported.

---

## 4. Exact List of Existing Files Proposed for Minimal Changes (Requires Approval)

Per the **Strict Website Protection & Authorization Rules**, **zero existing files have been modified yet**. Below are the ONLY 3 existing files that require a minimal hook to activate the isolated tracking system:

| # | Existing File | Why Change Is Needed | Exact Change Proposed | Systems Potentially Affected | Impact If Not Changed |
|---|---|---|---|---|---|
| 1 | `index.html` | Static / Vite entry point must load the isolated browser tracking SDK asynchronously. | Add **1 line** (`<script defer src="./tracking/sdk/dcbd-tracking-loader.js"></script>`) right before `</body>`. | None (deferred script, isolated namespace, fails silently if offline/blocked). | Browser SDK (`window.DCBDTracking`) will not load on static/Vite pages. |
| 2 | `includes/bootstrap.php` | PHP SSR entry point must load the isolated browser tracking SDK asynchronously. | Add **1 line** (`<script defer src="/tracking/sdk/dcbd-tracking-loader.js"></script>`) right before `</body>`. | None (deferred script, zero CSS/DOM/layout changes). | Browser SDK will not load on PHP-rendered routes. |
| 3 | `api/index.php` | Authoritative server-side `purchase` events must be enqueued from real server order records without blocking checkout. | Add a **5-line `try/catch` hook** inside the existing post-flush background section of `orders/create` and `orders/update_status` to call `DcbdTrackingQueue::enqueueOrderEvent(...)`. | Order creation response stays `<5ms` (runs strictly after `dcbd_flush_json_and_continue_background()`). | Server-side CAPI/GA4/TikTok purchase events would not trigger from authoritative order records. |

**Existing files NOT modified:** `src/main.js`, `src/router.js`, `src/store/cartStore.js`, `src/pages/storefront/*`, `src/pages/admin/*`, `src/styles/*`, `includes/config.php`, `includes/cache_engine.php`, `includes/seo_renderer.php`, `storage/dreamcartbd.sqlite` existing tables.

---

## 5. Additional Owner Approvals Requested Before Coding

1. **Approval for the 3 minimal hooks** listed in Section 4 (`index.html`, `includes/bootstrap.php`, `api/index.php`).
2. **Consent Banner Approval (Design Protection Rule 5):** Should we include a lightweight, non-intrusive, site-matched **Consent Banner** (matching Dream Cart BD's emerald/slate theme) to gate non-essential advertising pixels, OR keep it disabled by default in the Admin Dashboard until you turn it on?
3. **Live Hosting Confirmation:** Is `dreamcartbd.com` currently deployed on **cPanel / PHP hosting** (recommended for all-in-one PHP + SQLite3 + cron) or **GitHub Pages / Cloudflare Pages** (static-only)?
4. **Purchase Trigger Default Rule:** Should `Purchase` fire at **Confirmed Order Placement** (for both COD and Online orders, while tagging COD vs Paid separately) or **Only After Verified Payment / Delivery**? (Both will remain switchable anytime from `/admin/tracking/`.)

---

## 6. Performance & Zero-Regression Guarantee
- **Before Baseline Recorded:** `index.html` (26 KB), `src/main.js` (60 KB), `src/styles/main.css` (66 KB), `api/index.php` (47 KB).
- **After Target:** Browser loader `< 1.5 KB` (`defer`), SDK `< 10 KB` loaded asynchronously only when enabled, zero render-blocking scripts, zero third-party API calls on the checkout critical path, Before/After latency and payload benchmarks included in `TRACKING_TEST_PLAN.md`.
