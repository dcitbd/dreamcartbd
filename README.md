# 🛒 Dream Cart BD — Smart Digital Commerce Platform
> **Enterprise-Grade Headless E-Commerce OS with Real-Time Two-Way Google Sheets Sync**

[![Live API](https://img.shields.io/badge/Google_Apps_Script-Live_API-0F9D58?style=for-the-badge&logo=google)](https://script.google.com/macros/s/AKfycbyuyANFCLHnE-GGbGnx_1yr2Z_BOPWv-qBqh-1zQg4knzmMXnL15ERsbeOCfBNBZwys/exec)
[![Database](https://img.shields.io/badge/Database-Google_Sheets_(30+_Tables)-34A853?style=for-the-badge&logo=googlesheets)](https://docs.google.com/spreadsheets/d/19tz5stOSkfR0pLbRRVBIbM-qdOMbUTk0QD8Xf4Of1Pc/edit)
[![Frontend](https://img.shields.io/badge/Frontend-Vite_+_Tailwind_CSS-06B6D4?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Proprietary_DCBD-0284C7?style=for-the-badge)](LICENSE)

---

## 🌟 এক্সিকিউটিভ ওভারভিউ (Executive Overview)

**Dream Cart BD** একটি আল্ট্রা-ফাস্ট, স্কেলেবল এবং মডার্ন ডিজিটাল কমার্স প্ল্যাটফর্ম। কোনো ব্যয়বহুল ডেডিকেটেড ডাটাবেজ সার্ভার ছাড়াই এটি **Google Sheets**-কে একটি রিলেশনাল ডাটাবেজ হিসেবে ব্যবহার করে এবং **Google Apps Script Web App API Gateway** ও **Google Drive Storage**-এর সাথে স্বয়ংক্রিয় **Two-Way Real-time Sync** বজায় রাখে।

---

## 🏗️ সিস্টেম আর্কিটেকচার (System Architecture)

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      DREAM CART BD ARCHITECTURE                        │
 └────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│       CUSTOMER STOREFRONT    │              │    ADMIN & PARTNER SUITE     │
│   • 1-Page Express Checkout  │              │   • Inline Price/Stock Editor│
│   • 10-Image Gallery / Specs │              │   • Fraud Prevention Engine  │
│   • Real-Time Order Tracking │              │   • Multi-Courier Automation │
└──────────────┬───────────────┘              └──────────────┬───────────────┘
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      │ (REST JSON via SWR Client)
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       GOOGLE APPS SCRIPT API GATEWAY (V8)        │
             │   • Atomic Locks (LockService)                   │
             │   • In-Memory Cache (CacheService)               │
             │   • JWT Auth & Multi-Tier RBAC Engine            │
             └────────────────────────┬─────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  GOOGLE SHEETS (DATABASE)    │              │     GOOGLE DRIVE STORAGE     │
│   • 30+ Relational Tables    │              │   • Product Images & CDN     │
│   • onEdit Two-Way Triggers  │              │   • Encrypted JSON Backups   │
└──────────────────────────────┘              └──────────────────────────────┘
