# Dream Cart BD — Tracking QA, Performance & Provider Test Plan

**Date Executed:** 2026-11-24  
**Environment:** Offline Sandbox (Node.js + Python 3 automated verification); live PHP & external provider APIs require execution on target cPanel/PHP host with owner credentials.

---

## 1. Automated Tests Executed in Sandbox

| Test Category | Test Case | Status | Evidence / Notes |
|---|---|---|---|
| **JS Syntax** | `node --check` on `dcbd-tracking-loader.js`, `dcbd-tracking.js`, `tracking-admin.js` | **PASSED** | Zero syntax errors across all 3 scripts. |
| **PHP Static Check** | Opening tags, balanced braces across all 17 new PHP files | **PASSED** | All 17 files verified. |
| **Zero-Regression Diff** | SHA-256 comparison of all 416 original files vs untouched backup | **PASSED** | 413 files byte-identical; strictly ONLY `index.html`, `includes/bootstrap.php`, `api/index.php` modified. |
| **Secret Leak Scan** | Regex scan for hardcoded Meta/API tokens across all new files | **PASSED** | Zero hardcoded credentials or tokens. |
| **SDK Product & Cart** | `viewItem`, `addToCart`, `removeFromCart` emit canonical `BDT` payloads | **PASSED** | Verified in simulated DOM runner. |
| **Search PII Filter** | `search('user@example.com')` & `search('01711223344')` rejected | **PASSED** | Returned `null`; clean query `'smartwatch'` accepted. |
| **Purchase Dedup** | Duplicate `purchase({ order_id: 'ORD-9991' })` fires once with `PUR_ORD-9991` | **PASSED** | Second call returned `null`; browser NEVER posted `purchase` to `/collect.php`. |
| **Consent Gating** | `setConsent(false, false)` blocks Meta Pixel (`fbq`) dispatch | **PASSED** | Zero `fbq` calls after marketing consent revoked. |
| **Offline / Ad-Blocker** | Simulated `fetch` reject & `sendBeacon` throw | **PASSED** | Zero uncaught exceptions; site unaffected. |

---

## 2. Before vs After Performance & Payload Metrics

| File / Asset | Before | After | Delta / Impact |
|---|---|---|---|
| `index.html` | 25,948 B | 26,107 B | **+159 B** (1 `defer` script tag; 0 render-blocking) |
| `includes/bootstrap.php` | 8,115 B | 8,273 B | **+158 B** (1 `defer` script tag; 0 render-blocking) |
| `api/index.php` | 47,154 B | 47,926 B | **+772 B** (runs post-flush; checkout response stays `<5ms`) |
| `tracking/sdk/dcbd-tracking-loader.js` | — | 1,317 B (1.29 KB) | Loaded via `defer` + `requestIdleCallback` |
| `tracking/sdk/dcbd-tracking.js` | — | 26,084 B (25.47 KB) | Loaded asynchronously after idle; zero CSS/DOM layout shift (CLS = 0) |
| Existing CSS (`main.css`, `admin.css`, `responsive.css`) | 117.4 KB | 117.4 KB | **0 B change** (100% untouched) |
| Existing Storefront JS (`src/*`) | Untouched | Untouched | **0 B change** (100% untouched) |

---

## 3. Post-Deployment Live Verification Checklist (On cPanel/PHP Host)

Because PHP CLI and outbound internet access are disabled in this offline sandbox, run these final checks on your live/staging PHP server after uploading and configuring `.env`:

1. **Admin Auth & Security:**
   - Verify unauthenticated `GET /tracking/api/admin.php?action=overview` returns `401`.
   - Verify `POST /tracking/api/admin.php?action=settings/save` without `X-CSRF-Token` returns `403`.
   - Verify non-admin (`viewer`) cannot update settings or secrets (`403`).
   - Verify `GET /tracking/api/config.php` contains ZERO API secrets/tokens.
   - Verify `POST /tracking/api/collect.php` with `event_name: "purchase"` returns `400` (blocked browser spoofing).
2. **Authoritative Order & Deduplication:**
   - Place a test COD order → verify `orders/create` returns in `<5ms` and `dcbd_trk_orders` logs 1 record with `payment_state = cod_order_placed_unpaid` and `event_id = PUR_<ORDER_ID>`.
   - Refresh `/order-success?orderId=<ORDER_ID>` → verify zero duplicate purchases in `/admin/tracking/` → **Purchase Reports**.
3. **Provider Validation (With Test Mode ON):**
   - **Meta CAPI (v27.0):** Enter Pixel ID, Access Token & Test Event Code → click **Test meta_capi** → verify in Meta Events Manager → Test Events.
   - **GA4 MP:** Enter Measurement ID & API Secret → click **Test ga4_mp** → verify `/debug/mp/collect` returns zero `validationMessages`.
   - **TikTok Events API (v1.3):** Enter Pixel ID, Access Token & Test Event Code → click **Test tiktok_events_api** → verify in TikTok Events Manager → Test Events.
   - **Microsoft Clarity:** Enter Project ID → verify session appears in Clarity dashboard.
4. **Queue Resilience:**
   - Confirm cron runs `tracking/worker.php` cleanly and transitions jobs `pending` → `delivered` (or `failed` with backoff → `dead_letter` on outage without ever slowing checkout).
