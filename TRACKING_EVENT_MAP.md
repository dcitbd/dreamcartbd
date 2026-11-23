# Dream Cart BD — Canonical Event Schema & Platform Event Map

**Schema Version:** `1.0.0`  
**Currency Default:** `BDT`  
**Documentation Verified Date:** `2026-11-24`  

---

## 1. Canonical Event Envelope (`v1.0.0`)

Every event collected by `window.DCBDTracking` or generated server-side by `api/index.php` conforms to:

```json
{
  "schema_version": "1.0.0",
  "event_id": "PUR_ORD-261124-1001",
  "event_name": "purchase",
  "event_time": 1795457428,
  "event_source_url": "https://dreamcartbd.com/order-success?orderId=ORD-261124-1001",
  "action_source": "website",
  "currency": "BDT",
  "value": 8580.00,
  "order_id": "ORD-261124-1001",
  "payment_state": "cod_order_placed_unpaid",
  "items": [
    {
      "item_id": "DCBD-WT-01",
      "item_name": "Amazfit GTS 4 Smartwatch",
      "price": 8490.00,
      "quantity": 1,
      "item_category": "Smartwatches",
      "item_brand": "Amazfit"
    }
  ],
  "consent_state": {
    "necessary": true,
    "analytics": true,
    "marketing": true,
    "gpc": false,
    "timestamp": "2026-11-24T00:10:28+06:00"
  },
  "attribution": {
    "fbc": "fb.1.1795457400000.IwAR...",
    "fbp": "fb.1.1795457400000.1234567890",
    "gclid": "",
    "ttclid": "",
    "ga_client_id": "123456789.1795457400"
  }
}
```

---

## 2. Multi-Platform Event Mapping Table

| Canonical Event | Trigger Source | GA4 Recommended Event | Meta Pixel / CAPI (v27.0) | TikTok Pixel / Events API (v1.3) | Google Ads |
|---|---|---|---|---|---|
| `page_view` | SPA route & initial load | `page_view` | `PageView` | `ttq.page()` (Browser) | — |
| `view_item_list` | Category / Shop listing | `view_item_list` | — | — | — |
| `select_item` | Product card click | `select_item` | — | — | — |
| `view_item` | Product detail view | `view_item` | `ViewContent` | `ViewContent` | — |
| `search` | Site search (PII-filtered) | `search` | `Search` | `Search` | — |
| `add_to_cart` | Cart item added | `add_to_cart` | `AddToCart` | `AddToCart` | — |
| `remove_from_cart` | Cart item removed | `remove_from_cart` | — | — | — |
| `view_cart` | `/cart` route opened | `view_cart` | — | — | — |
| `begin_checkout` | `/checkout` route opened | `begin_checkout` | `InitiateCheckout` | `InitiateCheckout` | — |
| `add_shipping_info` | Delivery zone selected | `add_shipping_info` | — | — | — |
| `add_payment_info` | Payment method selected | `add_payment_info` | `AddPaymentInfo` | `AddPaymentInfo` | — |
| `sign_up` | Customer registration | `sign_up` | `CompleteRegistration` | `CompleteRegistration` | — |
| `login` | Customer login | `login` | — | — | — |
| `generate_lead` | Checkout lead / draft | `generate_lead` | `Lead` | `SubmitForm` | — |
| `contact` | WhatsApp / Phone click | `contact` (custom) | `Contact` | `Contact` | — |
| `purchase` | **Authoritative Server Order (`api/index.php`)** | `purchase` (`transaction_id`) | `Purchase` (`event_id: PUR_{order_id}`) | `CompletePayment` (`event_id: PUR_{order_id}`) | `conversion` (`send_to: AW-ID/Label`) |
| `refund` | Server-side status correction | `refund` | — | — | — |

---

## 3. Purchase Accounting & COD vs Paid Integrity Rules

- **Authoritative Source:** Browser `purchase` calls NEVER write to `/tracking/api/collect.php`. Server-side `DcbdTrackingQueue::enqueueOrderEvent()` inside `api/index.php` is the single authoritative source.
- **Deduplication:** Both browser (`window.DCBDTracking.purchase`) and server (`api/index.php`) use identical `event_id = PUR_{order_id}`. Database enforces `UNIQUE(order_id, milestone)` on `dcbd_trk_orders`.
- **COD vs Paid Distinction:**
  - COD Order Placed → `payment_state = cod_order_placed_unpaid`
  - Manual Online TrxID Submitted → `payment_state = online_trx_submitted_unverified`
  - Admin Verified Paid / Delivered → `payment_state = payment_verified`
- **Configurable Business Rule:** Switchable in `/admin/tracking/` → **Consent & Privacy Settings** between `order_placed` (default) and `verified_paid_only`.
- **Blocked Orders:** Orders with status `cancelled`, `rejected`, `failed`, `fraud`, `fake`, `test`, or `returned` are never reported as purchases.

---

## 4. Official Documentation References (Checked: 2026-11-24)
- Meta Conversions API & Graph API v27.0: https://developers.facebook.com/documentation/ads-commerce/conversions-api | https://developers.facebook.com/documentation/development/graph-api/changelog
- GA4 Measurement Protocol: https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference | https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events
- Google Tag Manager & Consent Mode: https://developers.google.com/tag-platform/tag-manager | https://developers.google.com/tag-platform/security/guides/consent
- Google Ads Enhanced Conversions: https://support.google.com/google-ads/answer/13258081?hl=en | https://support.google.com/google-ads/answer/13262500?hl=en
- TikTok Events API v1.3: https://business-api.tiktok.com/portal/docs/events-api-web/v1.3 | https://business-api.tiktok.com/portal/docs/event-deduplication/v1.3
- Microsoft Clarity: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup
