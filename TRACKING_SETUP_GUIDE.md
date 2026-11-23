# Dream Cart BD — Tracking System Setup, Deployment & Rollback Guide

**Date:** 2026-11-24  

---

## 1. Hosting Requirements
- **Recommended (cPanel / Apache / LiteSpeed PHP Hosting):** PHP `8.0+` with `pdo_sqlite`, `curl`, and `openssl` extensions enabled (standard on cPanel).
- **If Deployed on Static-Only Hosting (GitHub Pages / Cloudflare Pages):** Deploy the `tracking/` and `admin/tracking/` directories on a PHP subdomain (e.g., `https://api.dreamcartbd.com`) and set `window.__DCBD_TRACKING_API_BASE__ = 'https://api.dreamcartbd.com/tracking/api';` before the loader script. Never put API tokens in static JS.

---

## 2. Step-by-Step Deployment Instructions (cPanel `public_html`)
1. **Backup Current Site:** Download a full backup of `public_html` before uploading.
2. **Upload & Extract:** Upload `dreamcartbd-tracking-integrated.zip` to `public_html` and extract.
3. **Configure `.env`:**
   - Copy `.env.example` to `.env` in `public_html/.env`.
   - Set a strong random 64-char hex value for `DCBD_TRK_APP_KEY`.
   - Set `DCBD_TRK_ADMIN_USERNAME` and a strong `DCBD_TRK_ADMIN_PASSWORD`.
   - Set a random `DCBD_TRK_CRON_TOKEN`.
   - Verify `.env` permissions are `0600` and `storage/` permissions are `0750`.
4. **Set Up Cron Job (cPanel > Cron Jobs):**
   - Run every 1 minute (or 5 minutes):
     ```bash
     * * * * * /usr/local/bin/php /home/YOUR_CPANEL_USER/public_html/tracking/worker.php >/dev/null 2>&1
     ```
5. **Sign In to `/admin/tracking/`:**
   - Visit `https://dreamcartbd.com/admin/tracking/` and sign in with your `.env` admin credentials.
   - *(If you didn't set `DCBD_TRK_ADMIN_PASSWORD` in `.env`, the system auto-generates a one-time password in `storage/.trk_initial_admin_password.txt`.)*

---

## 3. Entering Owner Credentials (Blank/Disabled by Default)
All platforms ship **disabled** until you supply your real IDs/tokens in `/admin/tracking/`:

| Credential | Where to Obtain It | Where to Enter |
|---|---|---|
| **GTM Container ID** (`GTM-XXXXXXX`) | Google Tag Manager → Admin → Container ID | `/admin/tracking/` → 3. Pixel / Measurement IDs |
| **GA4 Measurement ID** (`G-XXXXXXXXXX`) | GA4 → Admin → Data Streams → Web Stream | `/admin/tracking/` → 3. Pixel / Measurement IDs |
| **GA4 API Secret** *(Server Only)* | GA4 → Admin → Data Streams → Measurement Protocol API secrets | `/admin/tracking/` → 4. Server API Credentials |
| **Google Ads Conversion ID & Label** | Google Ads → Goals → Conversions → Purchase Action → Tag Setup | `/admin/tracking/` → 3. Pixel / Measurement IDs |
| **Meta Pixel / Dataset ID** | Meta Events Manager → Data Sources → Settings | `/admin/tracking/` → 3. Pixel / Measurement IDs |
| **Meta CAPI Access Token** *(Server Only)* | Meta Events Manager → Settings → Conversions API → Generate access token | `/admin/tracking/` → 4. Server API Credentials |
| **Meta Test Event Code** *(Test Only)* | Meta Events Manager → Test Events tab | `/admin/tracking/` → 3. Pixel / Measurement IDs |
| **TikTok Pixel ID** | TikTok Events Manager → Web Events → Pixel ID | `/admin/tracking/` → 3. Pixel / Measurement IDs |
| **TikTok Events API Token** *(Server Only)* | TikTok Events Manager → Settings → Generate Access Token | `/admin/tracking/` → 4. Server API Credentials |
| **Microsoft Clarity Project ID** | Clarity Dashboard → Settings → Overview | `/admin/tracking/` → 3. Pixel / Measurement IDs |

After entering credentials:
1. Turn ON **Global Test / Debug Mode** in **2. Platform Connections**.
2. Click **Test Connection** for each enabled provider and verify events appear in Meta Test Events / GA4 DebugView / TikTok Test Events.
3. Turn OFF **Global Test / Debug Mode** when ready for live production traffic.

---

## 4. Instant Disable & Rollback Instructions
- **Instant Kill-Switch (No code change):** Go to `/admin/tracking/` → **2. Platform Connections** → turn OFF **Master Tracking Kill-Switch** and click Save.
- **Full Rollback (< 1 minute):**
  1. Restore the 3 minimally touched files (`index.html`, `includes/bootstrap.php`, `api/index.php`) from your pre-deployment backup.
  2. Remove `tracking/` and `admin/tracking/` directories (optional: delete `storage/tracking.sqlite`).
  3. Zero existing storefront files, CSS, JS, or `storage/dreamcartbd.sqlite` tables were modified.
