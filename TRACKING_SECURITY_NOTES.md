# Dream Cart BD — Tracking Security & Privacy Architecture Notes

**Date:** 2026-11-24  
**Scope:** `tracking/*`, `admin/tracking/*`, `storage/tracking.sqlite`

---

## 1. Secret Management & Zero Frontend Exposure
- **Encrypted at Rest:** All server-only secrets (`meta_capi_access_token`, `ga4_api_secret`, `tiktok_events_api_token`) are encrypted using **OpenSSL AES-256-GCM** (`tracking/crypto.php`) before writing to `dcbd_trk_secrets` in `storage/tracking.sqlite`.
- **Strict Masking:** `/tracking/api/admin.php` returns ONLY masked previews (e.g. `EAAX••••••••••••9A2B`). Full secrets are never sent back to the browser.
- **Public Config Isolation:** `/tracking/api/config.php` returns ONLY public measurement/pixel IDs and consent defaults — zero tokens, zero internal paths.
- **Git & Storage Protection:** `.gitignore` excludes `.env`, `storage/*.sqlite*`, and `storage/logs/`. `storage/.htaccess` denies direct HTTP access (`Require all denied`).

## 2. Authentication, RBAC, CSRF & Brute-Force Protection
- **Session Hardening:** `DCBD_TRK_SESS` uses `HttpOnly`, `SameSite=Strict`, `Secure` (on HTTPS), and `session_regenerate_id(true)` on login.
- **Password Hashing:** Uses PHP `password_hash(..., PASSWORD_DEFAULT)` (bcrypt/argon2).
- **Login Throttling:** Per-IP rate limit (20 requests / 15 min) + per-account lockout (5 failed attempts → 15-minute lock).
- **Role-Based Access Control (RBAC):** `super_admin`, `admin`, `analyst`, `viewer`. Non-admin roles cannot alter platform settings, secrets, or users.
- **CSRF Protection:** All state-changing POST requests to `/tracking/api/admin.php` require a matching `X-CSRF-Token` header verified via `hash_equals()`.
- **Audit Logging:** Every login, setting change, secret update, provider test, queue replay, and user creation is logged in `dcbd_trk_audit_logs` with automatic redaction of secret fields.

## 3. Collector, SSRF, XSS, SQLi & Event Spoofing Controls
- **SQL Injection Prevention:** 100% parameterized PDO prepared statements across all queries.
- **XSS Prevention:** All dashboard outputs are HTML-escaped (`esc()`), and API responses set `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`.
- **SSRF Prevention:** `DcbdTrackingHttp::postJson()` enforces HTTPS-only and a strict official host allowlist (`graph.facebook.com`, `www.google-analytics.com`, `business-api.tiktok.com`, `googleads.googleapis.com`, `api.pinterest.com`, `tr.snapchat.com`). Browser input cannot specify destination URLs.
- **Event Spoofing Prevention:** `/tracking/api/collect.php` enforces POST-only, Origin allowlist, 32 KB body cap, per-IP rate limiting (120 req/min), and **rejects browser-submitted `purchase` and `refund` events**.
- **PII Minimization & Hashing:** Search queries containing emails or 11–16 digit numbers are dropped. Permitted customer identifiers (email, phone normalized to `8801XXXXXXXXX`, first name) are SHA-256 hashed immediately upon ingestion only when marketing consent is granted.

## 4. Recommended Privacy & Cookie Policy Update (For `PrivacyPage.js`)
Before enabling marketing pixels in production, add a short clause to Dream Cart BD's Privacy Policy (`/privacy`) stating:
1. **Providers Used:** Meta (Facebook/Instagram Pixel & Conversions API), Google (Tag Manager, Analytics 4, Google Ads), TikTok (Pixel & Events API), and Microsoft Clarity.
2. **Purposes & Data Categories:** Site performance analytics, session diagnostics, and ad conversion measurement using pseudonymous click IDs and hashed contact data (email/phone) where permitted.
3. **User Choices:** Visitors can opt out of analytics/marketing cookies via browser Global Privacy Control (GPC) or the site's Consent Preferences control (enableable in `/admin/tracking/`).
