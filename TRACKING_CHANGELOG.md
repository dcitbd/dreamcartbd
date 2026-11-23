# Dream Cart BD — Tracking System Changelog

## [1.0.0] — 2026-11-24

### Added (100% Isolated New Directories & Documentation)
- **Environment & Git Protection:** `.env.example`, `.gitignore`.
- **Isolated Tracking Backend (`tracking/`):**
  - `tracking/config.php`, `tracking/crypto.php` (AES-256-GCM encryption & masking), `tracking/db.php` (isolated `storage/tracking.sqlite` with 10 tables), `tracking/schema.php` (canonical schema v1.0.0), `tracking/consent.php`, `tracking/queue.php` (durable queue, leases, backoff+jitter, `UNIQUE(order_id, milestone)` purchase dedup), `tracking/worker.php` (cron/CLI/HTTP worker), `tracking/bootstrap.php`.
  - **Modular Server Adapters (`tracking/adapters/`):** `AdapterInterface.php` (HTTPS + SSRF allowlist), `MetaCapiAdapter.php` (Graph API v27.0), `Ga4MpAdapter.php` (GA4 MP + `/debug/mp/collect`), `TikTokEventsAdapter.php` (Events API v1.3 consolidated endpoint), `GoogleAdsAdapter.php` (consent-gated Enhanced Conversions + Pinterest & Snapchat extensible stubs + `AdapterRegistry`).
  - **First-Party APIs (`tracking/api/`):** `config.php` (public non-secret config), `collect.php` (rate-limited, size-capped, origin-checked collector), `admin.php` (session/RBAC/CSRF/throttled Admin API).
- **Browser Tracking SDK (`tracking/sdk/`):**
  - `dcbd-tracking-loader.js` (<1.2 KB async/defer loader)
  - `dcbd-tracking.js` (`window.DCBDTracking`, consent-gated loaders for GTM/GA4/Google Ads/Meta/TikTok/Clarity, passive storefront observers, optional Consent Banner disabled by default).
- **Secure Admin Dashboard (`admin/tracking/`):**
  - `index.php`, `assets/tracking-admin.css` (strictly `.dcbd-trk-*` namespaced), `assets/tracking-admin.js` (all 13 required modules backed by real SQLite data).
- **Documentation Suite:** `TRACKING_IMPLEMENTATION_PLAN.md`, `TRACKING_EVENT_MAP.md`, `TRACKING_SECURITY_NOTES.md`, `TRACKING_SETUP_GUIDE.md`, `TRACKING_TEST_PLAN.md`, `TRACKING_CHANGELOG.md`.

### Changed (Strictly Limited to 3 Approved Minimal Hooks)
- `index.html`: Added 1 deferred `<script>` line before `</body>` to load `tracking/sdk/dcbd-tracking-loader.js`.
- `includes/bootstrap.php`: Added 1 deferred `<script>` line before `</body>` to load `/tracking/sdk/dcbd-tracking-loader.js`.
- `api/index.php`: Added non-blocking post-flush `try/catch` hooks inside `orders/create` and `orders/update_status` to enqueue authoritative server-side `purchase` events into `DcbdTrackingQueue::enqueueOrderEvent()`.

### Unchanged (100% Preserved)
- All 413 other existing files including `src/main.js`, `src/router.js`, `src/store/*`, `src/pages/storefront/*`, `src/pages/admin/*`, `src/styles/*`, `includes/config.php`, `includes/cache_engine.php`, `includes/seo_renderer.php`, and all existing tables in `storage/dreamcartbd.sqlite`.
