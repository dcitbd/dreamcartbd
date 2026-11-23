# Dream Cart BD — Meta Pixel & CAPI Deployment Verification Report

**Website:** https://dreamcartbd.com  
**Meta Pixel ID:** `2237994360112976`  
**Verification Date:** `2026-11-24`  
**Deployment Status:** **Package Ready (`dreamcartbd-tracking-integrated.zip`) — NOT YET DEPLOYED to live cPanel/production** (sandbox has no live hosting credentials, PHP CLI, or outbound internet).

---

## 1. 10-Point Verification Matrix (Evidence-Backed)

| # | Verification Requirement | Status | Actual Evidence / Remaining Action |
|---|---|---|---|
| 1 | Confirm Pixel ID `2237994360112976` active in config | **VERIFIED IN PACKAGE** / Pending Live | `tracking/config.php` has `'meta_pixel_enabled' => true` and `'meta_pixel_id' => dcbd_trk_env('META_PIXEL_ID', '2237994360112976')`; `.env.example` updated. Live check required after cPanel upload. |
| 2 | Only approved tracking changes included | **PASSED (SHA-256)** | Full SHA-256 diff vs untouched original backup confirms strictly **4** original files modified (`index.html`, `includes/bootstrap.php`, `includes/cache_engine.php`, `api/index.php`); **412** original files byte-identical. |
| 3 | No duplicate Meta Pixel init or `PageView` | **PASSED (Automated VM)** | Both `CleanIsolatedBoot` (`init=1, initialPV=1`) and `LegacySSRPlusIsolatedSDK` (`init=1, initialPV=1`) confirmed zero duplicate init or `PageView` calls. |
| 4 | Verify Browser Pixel & Server CAPI independently | **Browser: PASSED (VM)** / **Live CAPI: PENDING** | Browser Pixel dispatch verified in Node VM. Live CAPI (`POST https://graph.facebook.com/v27.0/2237994360112976/events`) requires cPanel PHP host + owner's live `META_CAPI_ACCESS_TOKEN` + `META_TEST_EVENT_CODE`. |
| 5 | Event ID deduplication implemented & verified | **PASSED (Automated VM & Schema)** | Browser & server share deterministic `PUR_{order_id}` (`PUR_ORD-2026-8801`). Duplicate `sdk.purchase()` call returned `null`; `dcbd_trk_orders` enforces `UNIQUE(order_id, milestone)`. |
| 6 | Test `PageView`, `ViewContent`, `Search`, `AddToCart`, `InitiateCheckout`, `Purchase` | **PASSED (Automated VM)** | All 6 Meta events verified with valid `eventID`s and canonical `BDT` payloads (see verbatim log below). |
| 7 | `Purchase` uses authoritative server order creation | **PASSED (Code + VM)** | Browser SDK never posts `purchase` to `/tracking/api/collect.php` (server also rejects browser-spoofed `purchase`). `api/index.php` enqueues authoritative `purchase` post-flush via `DcbdTrackingQueue::enqueueOrderEvent()`. |
| 8 | Distinguish COD pending, online submitted, payment verified | **PASSED (Code)** | `tracking/queue.php` assigns `cod_order_placed_unpaid`, `online_trx_submitted_unverified`, or `payment_verified`, blocks cancelled/fraud/test orders, and supports `verified_paid_only` toggle in `/admin/tracking/`. |
| 9 | CAPI tokens never exposed in HTML, JS, `localStorage`, API, or Sheets | **PASSED IN PACKAGE** / **Manual Sheet Check Required** | `includes/cache_engine.php` strips `fbCapiToken` & `FB_CAPI_Token` from SSR hydration; `tracking/api/config.php` exposes zero secrets; `tracking/crypto.php` encrypts tokens (AES-256-GCM). **Owner action:** clear any old `FB_CAPI_Token` from your live Google Sheet `Settings` tab and old Admin Settings. |
| 10 | Existing design, SEO, checkout, cart, orders, payment, admin unchanged | **PASSED (SHA-256)** | All 412 storefront/CSS/JS/admin/SEO files are 100% untouched; existing `storage/dreamcartbd.sqlite` tables untouched. |

---

## 2. Verbatim Automated Test Logs (2026-11-24)

```text
[PASS] CleanIsolatedBoot: init=1, initialPV=1, events=PageView(DCBD_PAGE_VIE_1795463484_7ma0z5wr), ViewContent(DCBD_VIEW_ITE_1795463484_r7w1y705), Search(DCBD_SEARCH_1795463484_un1rzt66), AddToCart(DCBD_ADD_TO_C_1795463484_4bdqqbpl), InitiateCheckout(DCBD_BEGIN_CH_1795463484_5eujshzs), Purchase(PUR_ORD-2026-8801)
[PASS] LegacySSRPlusIsolatedSDK: init=1, initialPV=1, events=PageView(ssr), ViewContent(DCBD_VIEW_ITE_1795463485_chru81ag), Search(DCBD_SEARCH_1795463485_llkz35s3), AddToCart(DCBD_ADD_TO_C_1795463485_ia80zujg), InitiateCheckout(DCBD_BEGIN_CH_1795463485_gm6toclb), Purchase(PUR_ORD-2026-8801)
[PASS] Modified original files (4 approved only): ['api/index.php', 'includes/bootstrap.php', 'includes/cache_engine.php', 'index.html']
[PASS] tracking/config.php active default: meta_pixel_enabled=true, meta_pixel_id=2237994360112976
[PASS] includes/cache_engine.php strips fbCapiToken & FB_CAPI_Token from browser SSR hydration
[PASS] api/index.php + tracking/queue.php enforce authoritative Purchase + COD/Online/Verified states
[PASS] tracking/api/config.php exposes zero secrets/tokens
```

---

## 3. Failed / Pending Live Production Tasks (Require Owner Execution on cPanel)
- **Live cPanel Deployment:** Upload and extract `dreamcartbd-tracking-integrated.zip` to `public_html`, create `.env` from `.env.example`, and add the `tracking/worker.php` cron job.
- **Google Sheet Cleanup:** Clear any legacy `FB_Pixel_ID` and `FB_CAPI_Token` values from your live Google Sheet `Settings` tab.
- **Live Meta CAPI & Pixel Verification:**
  1. Sign in to `https://dreamcartbd.com/admin/tracking/`.
  2. Enter your Meta CAPI Access Token in **4. Server API Credentials** (AES-256-GCM encrypted) and your Meta Test Event Code in **3. Pixel / Measurement IDs**.
  3. Enable **Meta CAPI** and **Test Mode** in **2. Platform Connections**, click **Test meta_capi**, and verify both Browser Pixel (via Meta Pixel Helper) and Server CAPI deduplication (`PUR_<ORDER_ID>`) inside **Meta Events Manager → Test Events**.
  4. Turn OFF **Test Mode** once live deduplication is confirmed.
