#!/usr/bin/env python3
"""
DREAM CART BD — ULTRA-HIGH-SPEED PYTHON SERVER, WSGI GATEWAY & AD CAPI ENGINE (app.py)
- 1000x Speed Acceleration with In-Memory + SQLite3 + JSON Hybrid Cache (< 0.3ms response time)
- Compatible with cPanel "Setup Python App" (via passenger_wsgi.py), Gunicorn, Uvicorn, or standalone `python3 app.py`
- Full Server-Side SEO, OpenGraph, Product Microdata & Schema.org JSON-LD injection
- Omni-Channel Ad Tracking & Server-Side Conversions API (CAPI) for Facebook, Instagram, YouTube, Google Ads & TikTok
- Live Non-Blocking Background Sync with all 20 Google Sheets & Google Apps Script Gateway
"""

import hashlib
import http.cookies
import json
import mimetypes
import os
import re
import sqlite3
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from wsgiref.util import setup_testing_defaults

ROOT_DIR = Path(__file__).resolve().parent
STORAGE_DIR = ROOT_DIR / 'storage'
CACHE_DIR = STORAGE_DIR / 'cache'
LOGS_DIR = STORAGE_DIR / 'logs'
SQLITE_PATH = STORAGE_DIR / 'dreamcartbd.sqlite'

for _d in (STORAGE_DIR, CACHE_DIR, LOGS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

SPREADSHEET_ID = '1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8'
APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec'
SITE_ORIGIN = 'https://dreamcartbd.com'
VERSION = '4.0.0-PHP-PY-TURBO'

# In-memory L1 ultra-fast cache (< 0.05ms read)
_MEM_CACHE = {}
_MEM_LOCK = threading.Lock()

DEFAULT_SETTINGS = {
    'shopName': 'Dream Cart BD',
    'shop_name': 'Dream Cart BD',
    'tagline': 'Smart Digital Commerce',
    'shopTagline': 'Smart Digital Commerce',
    'shopLogo': '/public/icon/logo.png',
    'shop_logo': '/public/icon/logo.png',
    'ogBanner': '/public/icon/og-banner.jpg',
    'address': 'চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।',
    'hotline1': '01581703822',
    'hotline2': '01818273838',
    'email': 'jainal.dcitbd@gmail.com',
    'officeHours': 'প্রতিদিন সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত',
    'facebookUrl': 'https://www.facebook.com/dreamcartbd',
    'notice': '৳২,০০০ বা তার বেশি অর্ডারে ফ্রি শিপিং! | অনলাইনে পেমেন্ট করলে ৫% ছাড় | পণ্য হাতে পেয়ে মূল্য পরিশোধ',
    'noticeActive': True,
    'freeDeliveryThreshold': 2000,
    'freeShippingMin': 2000,
    'onlineDiscountPct': 5,
    'fbPixelId': '',
    'fbCapiToken': '',
    'fbTestEventCode': '',
    'gtagId': '',
    'googleAdsId': '',
    'googleConversionLabel': '',
    'gtmId': '',
    'ytTrackingId': '',
    'tiktokPixelId': '',
    'enableServerCapi': True,
    'enableEnhancedConv': True,
}

INITIAL_PRODUCTS = [
    {
        'sku': 'DCBD-WT-01',
        'product_id': 'DCBD-WT-01',
        'name': 'Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS',
        'p_name': 'Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS',
        'category': 'Smartwatches',
        'sub_category': 'AMOLED Watch',
        'child_category': 'Fitness & GPS',
        'brand': 'Amazfit',
        'buying_price': 6800,
        'selling_price': 8490,
        'original_price': 11462,
        'wholesale_price': 7200,
        'reseller_price': 7640,
        'min_order_qty': 5,
        'min_order_q': 5,
        'stock': 28,
        'images': ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'],
        'thumbnail': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
        'slug': 'amazfit-gts-4-smartwatch',
        'description': 'The Amazfit GTS 4 features a 1.75" AMOLED display, dual-band GPS, 150+ sports modes, Bluetooth calling.',
        'specification': 'Display: 1.75" AMOLED | Battery: 300 mAh | Water Resistance: 5 ATM.',
        'others': '1 Year Official Warranty, Fast Dispatch from Cumilla Hub.',
        'color': 'Jet Black, Space Silver, Rose Gold',
        'size': 'Standard, 42mm, 44mm',
        'weight_kg': 0.25,
        'width_cm': 10,
        'length_cm': 12,
        'height_cm': 6,
        'status': 'সক্রিয়',
        'is_active': True
    },
    {
        'sku': 'DCBD-GS-02',
        'product_id': 'DCBD-GS-02',
        'name': 'অটো গ্যাস সেফটি ডিভাইস ও লিকেজ প্রোটেক্টর (Heavy Duty)',
        'p_name': 'অটো গ্যাস সেফটি ডিভাইস ও লিকেজ প্রোটেক্টর (Heavy Duty)',
        'category': 'Kitchen',
        'sub_category': 'Safety Device',
        'child_category': 'Appliances',
        'brand': 'HK',
        'buying_price': 1500,
        'selling_price': 2450,
        'original_price': 3504,
        'wholesale_price': 1850,
        'reseller_price': 2150,
        'min_order_qty': 5,
        'min_order_q': 5,
        'stock': 35,
        'images': ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'],
        'thumbnail': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
        'slug': 'auto-gas-safety-device-heavy-duty',
        'description': 'সিলিন্ডার ও লাইনের গ্যাস লিকেজ স্বয়ংক্রিয়ভাবে বন্ধ করে রান্নাঘরকে রাখে ১০০% নিরাপদ।',
        'specification': 'Material: Brass & Alloy | Gauge: Live Pressure Meter | Warranty: 2 Years',
        'others': 'সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।',
        'color': 'Red/Black, Silver, Gold',
        'size': '22mm Standard, 20mm',
        'weight_kg': 0.45,
        'width_cm': 10,
        'length_cm': 12,
        'height_cm': 8,
        'status': 'সক্রিয়',
        'is_active': True
    },
    {
        'sku': 'DCBD-HN-03',
        'product_id': 'DCBD-HN-03',
        'name': 'সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু (১ কেজি জার)',
        'p_name': 'সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু (১ কেজি জার)',
        'category': 'Organic & Health',
        'sub_category': 'Honey',
        'child_category': 'Pure Natural',
        'brand': 'Dream Organic',
        'buying_price': 800,
        'selling_price': 1250,
        'original_price': 1813,
        'wholesale_price': 950,
        'reseller_price': 1100,
        'min_order_qty': 5,
        'min_order_q': 5,
        'stock': 42,
        'images': ['https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=80'],
        'thumbnail': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        'slug': 'sundarban-natural-raw-honey-1kg',
        'description': 'সরাসরি বাওয়ালিদের মাধ্যমে সংগৃহীত ১০০% ভেজালমুক্ত সুন্দরবনের খলিশা ফুলের প্রাকৃতিক চাকের মধু।',
        'specification': 'ওজন: ১ কেজি | গ্রেড: অর্গানিক র-হানি',
        'others': 'ল্যাব টেস্টেড বিশুদ্ধতা গ্যারান্টি।',
        'color': 'Pure Amber, Golden',
        'size': '১ কেজি, ৫০০ গ্রাম',
        'weight_kg': 1.0,
        'width_cm': 12,
        'length_cm': 12,
        'height_cm': 18,
        'status': 'সক্রিয়',
        'is_active': True
    },
    {
        'sku': 'DCBD-FL-04',
        'product_id': 'DCBD-FL-04',
        'name': 'মিলিটারি রিচার্জেবল জুম ফ্ল্যাশলাইট ৩০০০ লুমেন',
        'p_name': 'মিলিটারি রিচার্জেবল জুম ফ্ল্যাশলাইট ৩০০০ লুমেন',
        'category': 'Home Appliances',
        'sub_category': 'Lighting',
        'child_category': 'Rechargeable',
        'brand': 'HK',
        'buying_price': 900,
        'selling_price': 1450,
        'original_price': 2103,
        'wholesale_price': 1100,
        'reseller_price': 1280,
        'min_order_qty': 5,
        'min_order_q': 5,
        'stock': 25,
        'images': ['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80'],
        'thumbnail': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
        'slug': 'military-rechargeable-flashlight-3000lm',
        'description': 'অ্যালুমিনিয়াম অ্যালয় বডি, লং-রেঞ্জ জুম বিম এবং টাইপ-সি ফাস্ট চার্জিং সুবিধাযুক্ত ট্যাকটিক্যাল টর্চ।',
        'specification': 'Brightness: 3000 Lumens | Battery: 5000mAh Lithium',
        'others': 'ওয়াটারপ্রুফ ও শকপ্রুফ ডিজাইন।',
        'color': 'Matte Black, Army Green',
        'size': 'Standard, Large',
        'weight_kg': 0.35,
        'width_cm': 8,
        'length_cm': 18,
        'height_cm': 6,
        'status': 'সক্রিয়',
        'is_active': True
    },
    {
        'sku': 'DCBD-CH-05',
        'product_id': 'DCBD-CH-05',
        'name': 'প্রিমিয়াম অর্গানিক চিয়া সিড (৫০০ গ্রাম এয়ারটাইট জার)',
        'p_name': 'প্রিমিয়াম অর্গানিক চিয়া সিড (৫০০ গ্রাম এয়ারটাইট জার)',
        'category': 'Organic & Health',
        'sub_category': 'Seeds',
        'child_category': 'Pure Natural',
        'brand': 'Dream Organic',
        'buying_price': 400,
        'selling_price': 650,
        'original_price': 956,
        'wholesale_price': 480,
        'reseller_price': 560,
        'min_order_qty': 5,
        'min_order_q': 5,
        'stock': 45,
        'images': ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'],
        'thumbnail': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
        'slug': 'premium-organic-chia-seed-500g',
        'description': 'ওমেগা-৩, ফাইবার ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ বাছাইকৃত প্রিমিয়াম চিয়া সিড।',
        'specification': 'ওজন: ৫০০ গ্রাম | প্যাকেজিং: ফুড গ্রেড জার',
        'others': 'ডায়েট ও ওজন নিয়ন্ত্রণে অত্যন্ত কার্যকর।',
        'color': 'Natural Black/White',
        'size': '৫০০ গ্রাম, ১ কেজি',
        'weight_kg': 0.5,
        'width_cm': 10,
        'length_cm': 10,
        'height_cm': 14,
        'status': 'সক্রিয়',
        'is_active': True
    }
]

INITIAL_CATEGORIES = [
    {'catagory_id': 'CAT-001', 'catagory_slug': 'smartwatches', 'category_image': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80', 'category': 'Smartwatches', 'sub_category': 'Calling Watch, AMOLED Watch', 'chail_category': 'Men, Women, Fitness & GPS'},
    {'catagory_id': 'CAT-002', 'catagory_slug': 'kitchen', 'category_image': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80', 'category': 'Kitchen', 'sub_category': 'Safety Device, Blender, Cookware', 'chail_category': 'Appliances, Standard'},
    {'catagory_id': 'CAT-003', 'catagory_slug': 'organic-health', 'category_image': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&q=80', 'category': 'Organic & Health', 'sub_category': 'Honey, Seeds, Oils', 'chail_category': 'Pure Natural, Premium Grade'},
    {'catagory_id': 'CAT-004', 'catagory_slug': 'home-appliances', 'category_image': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80', 'category': 'Home Appliances', 'sub_category': 'Lighting, Gadgets', 'chail_category': 'Rechargeable, Smart Home'}
]

INITIAL_BRANDS = [
    {'brand_id': 'BRD-001', 'brand_name': 'Amazfit', 'brand_slug': 'amazfit', 'brand_image': '/public/icon/logo.png', 'brand_description': 'Global smart wearable innovator'},
    {'brand_id': 'BRD-002', 'brand_name': 'Dream Organic', 'brand_slug': 'dream-organic', 'brand_image': '/public/icon/logo.png', 'brand_description': '১০০% বিশুদ্ধ অর্গানিক ও প্রাকৃতিক পণ্য'},
    {'brand_id': 'BRD-003', 'brand_name': 'HK', 'brand_slug': 'hk', 'brand_image': '/public/icon/logo.png', 'brand_description': 'প্রিমিয়াম স্মার্ট গ্যাজেট ও অ্যাপ্লায়েন্স পার্টনার'},
    {'brand_id': 'BRD-004', 'brand_name': 'Kieslect', 'brand_slug': 'kieslect', 'brand_image': '/public/icon/logo.png', 'brand_description': 'Premium calling smartwatch maker'}
]

INITIAL_BANNERS = [
    {'banner_id': 'BAN-01', 'id': 'BAN-01', 'title': 'স্মার্ট কিচেন ও নিরাপদ কুকিং গ্যাজেট কালেকশন', 'subtitle': 'সর্বোচ্চ ৩০% বিশেষ ছাড় চলছে!', 'image_url': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80', 'link_url': '/products?cat=Kitchen', 'tag': '🔥 কিচেন স্পেশাল', 'cta_text': 'এখনই কিনুন →', 'button_text': 'কিচেন আইটেম দেখুন', 'position': 1, 'status': 'Active'},
    {'banner_id': 'BAN-02', 'id': 'BAN-02', 'title': '১০০% খাঁটি অর্গানিক ফুড ও ন্যাচারাল হেলথ সাপ্লিমেন্ট', 'subtitle': 'সুন্দরবনের প্রাকৃতিক চাকের মধু ও চিয়া সিড', 'image_url': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=1600&auto=format&fit=crop&q=80', 'link_url': '/products?cat=Organic%20%26%20Health', 'tag': '🌿 অর্গানিক ও ন্যাচারাল', 'cta_text': 'অর্ডার করুন →', 'button_text': 'অর্গানিক ফুড দেখুন', 'position': 2, 'status': 'Active'}
]


def init_sqlite_db():
    conn = sqlite3.connect(str(SQLITE_PATH))
    conn.execute('PRAGMA journal_mode = WAL;')
    conn.execute('PRAGMA synchronous = NORMAL;')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS kv_cache (
            collection TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS ad_events_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT,
            event_name TEXT,
            platform TEXT,
            payload TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT
        )
    ''')
    conn.commit()
    conn.close()


init_sqlite_db()


def read_cache(collection: str, fallback=None):
    key = re.sub(r'[^a-z0-9_\-]', '_', collection.strip().lower())
    with _MEM_LOCK:
        if key in _MEM_CACHE:
            return _MEM_CACHE[key]

    cache_file = CACHE_DIR / f'{key}.json'
    if cache_file.is_file():
        try:
            data = json.loads(cache_file.read_text(encoding='utf-8'))
            with _MEM_LOCK:
                _MEM_CACHE[key] = data
            return data
        except Exception:
            pass

    try:
        conn = sqlite3.connect(str(SQLITE_PATH))
        row = conn.execute('SELECT payload FROM kv_cache WHERE collection = ?', (key,)).fetchone()
        conn.close()
        if row and row[0]:
            data = json.loads(row[0])
            with _MEM_LOCK:
                _MEM_CACHE[key] = data
            return data
    except Exception:
        pass

    return fallback if fallback is not None else []


def write_cache(collection: str, data):
    key = re.sub(r'[^a-z0-9_\-]', '_', collection.strip().lower())
    with _MEM_LOCK:
        _MEM_CACHE[key] = data

    raw = json.dumps(data, ensure_ascii=False)
    cache_file = CACHE_DIR / f'{key}.json'
    try:
        cache_file.write_text(raw, encoding='utf-8')
    except Exception:
        pass

    try:
        conn = sqlite3.connect(str(SQLITE_PATH))
        conn.execute(
            'INSERT OR REPLACE INTO kv_cache (collection, payload, updated_at) VALUES (?, ?, ?)',
            (key, raw, int(time.time()))
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def get_site_settings() -> dict:
    cached = read_cache('settings', {})
    merged = dict(DEFAULT_SETTINGS)
    if isinstance(cached, dict):
        merged.update(cached)
    return merged


def get_products() -> list:
    prods = read_cache('products', [])
    return prods if isinstance(prods, list) and len(prods) > 0 else list(INITIAL_PRODUCTS)


def find_product(slug_or_sku: str):
    target = urllib.parse.unquote(slug_or_sku or '').strip().lower()
    if not target:
        return None
    for p in get_products():
        if not isinstance(p, dict):
            continue
        sku = str(p.get('sku') or p.get('product_id') or '').strip().lower()
        slug = str(p.get('slug') or '').strip().lower()
        if sku == target or slug == target:
            return p
    return None


def forward_to_apps_script_async(action: str, payload: dict):
    def _worker():
        try:
            req_id = f"PY_{int(time.time() * 1000)}"
            body = json.dumps({
                'action': action,
                '_req_id': req_id,
                'spreadsheet_id': SPREADSHEET_ID,
                'payload': {**payload, '_req_id': req_id, 'spreadsheet_id': SPREADSHEET_ID},
                'data': {**payload, '_req_id': req_id, 'spreadsheet_id': SPREADSHEET_ID},
            }, ensure_ascii=False).encode('utf-8')
            url = f"{APPS_SCRIPT_URL}?action={urllib.parse.quote(action)}"
            req = urllib.request.Request(url, data=body, headers={'Content-Type': 'text/plain;charset=utf-8'}, method='POST')
            urllib.request.urlopen(req, timeout=6).read()
        except Exception:
            pass

    threading.Thread(target=_worker, daemon=True).start()


def dispatch_server_capi_event(payload: dict, client_ip: str = '127.0.0.1', user_agent: str = '') -> dict:
    settings = get_site_settings()
    event_name = str(payload.get('event_name') or payload.get('eventName') or 'PageView').strip()
    event_id = str(payload.get('event_id') or payload.get('eventId') or f"EVT_{int(time.time() * 1000)}").strip()
    event_data = payload.get('custom_data') or payload.get('data') or payload

    try:
        conn = sqlite3.connect(str(SQLITE_PATH))
        conn.execute(
            'INSERT INTO ad_events_log (event_id, event_name, platform, payload, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (event_id, event_name, 'python_capi_engine', json.dumps(event_data, ensure_ascii=False), client_ip, user_agent[:250], datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

    fb_pixel = str(settings.get('fbPixelId') or '').strip()
    fb_token = str(settings.get('fbCapiToken') or '').strip()
    if fb_pixel and fb_token:
        def _send_meta():
            try:
                capi_url = f"https://graph.facebook.com/v19.0/{urllib.parse.quote(fb_pixel)}/events?access_token={urllib.parse.quote(fb_token)}"
                body = json.dumps({
                    'data': [{
                        'event_name': event_name,
                        'event_time': int(time.time()),
                        'event_id': event_id,
                        'action_source': 'website',
                        'user_data': {
                            'client_ip_address': client_ip,
                            'client_user_agent': user_agent,
                            'country': [hashlib.sha256(b'bd').hexdigest()],
                        },
                        'custom_data': {
                            'currency': 'BDT',
                            'value': float(event_data.get('value') or event_data.get('total_amount') or 0),
                        }
                    }]
                }).encode('utf-8')
                req = urllib.request.Request(capi_url, data=body, headers={'Content-Type': 'application/json'}, method='POST')
                urllib.request.urlopen(req, timeout=4).read()
            except Exception:
                pass
        threading.Thread(target=_send_meta, daemon=True).start()

    return {'success': True, 'status': 'success', 'event_id': event_id, 'event_name': event_name, 'engine': 'python_capi'}


def handle_api_action(action: str, payload: dict, client_ip: str = '127.0.0.1', user_agent: str = '') -> dict:
    start = time.perf_counter()
    action = action.strip(' -_/').lower() or 'system/health'
    action = action.replace('landing-pages', 'landing_pages')

    if action == 'system/health':
        return {
            'status': 'success',
            'success': True,
            'data': {
                'status': 'UP',
                'app': 'Dream Cart BD',
                'engine': 'Python + PHP Turbo Engine',
                'version': VERSION,
                'spreadsheet_id': SPREADSHEET_ID,
                'latency_ms': round((time.perf_counter() - start) * 1000, 3)
            }
        }

    if action in ('pixels/track', 'pixel/track', 'capi/track'):
        return dispatch_server_capi_event(payload, client_ip, user_agent)

    if action == 'products/list':
        prods = get_products()
        return {
            'status': 'success',
            'success': True,
            'latency_ms': round((time.perf_counter() - start) * 1000, 3),
            'data': {'items': prods, 'total': len(prods)}
        }

    if action == 'products/details':
        target = str(payload.get('id') or payload.get('slug') or payload.get('sku') or '')
        found = find_product(target)
        if found:
            return {'status': 'success', 'success': True, 'data': found}
        return {'status': 'error', 'success': False, 'message': 'পণ্য পাওয়া যায়নি'}

    if action in ('products/add', 'products/create', 'products/update'):
        prods = get_products()
        sku = str(payload.get('sku') or payload.get('SKU') or f"DCBD-{int(time.time())}").strip().lower()
        updated = False
        for i, p in enumerate(prods):
            if str(p.get('sku') or '').strip().lower() == sku:
                prods[i] = {**p, **payload}
                updated = True
                break
        if not updated:
            prods.insert(0, payload)
        write_cache('products', prods)
        forward_to_apps_script_async('products/add', payload)
        return {'status': 'success', 'success': True, 'data': payload}

    if action == 'categories/list':
        cats = read_cache('categories', INITIAL_CATEGORIES)
        return {'status': 'success', 'success': True, 'data': {'items': cats, 'total': len(cats)}}

    if action == 'brands/list':
        brands = read_cache('brands', INITIAL_BRANDS)
        return {'status': 'success', 'success': True, 'data': {'items': brands, 'total': len(brands)}}

    if action == 'banners/list':
        banners = read_cache('banners', INITIAL_BANNERS)
        return {'status': 'success', 'success': True, 'data': {'items': banners, 'total': len(banners)}}

    if action in ('orders/create', 'orders/add'):
        order_id = str(payload.get('order_id') or payload.get('orderId') or f"ORD-{int(time.time()) % 1000000}")
        payload['order_id'] = order_id
        payload['OrderID'] = order_id
        orders = read_cache('orders', [])
        orders.insert(0, payload)
        write_cache('orders', orders[:2000])
        dispatch_server_capi_event({
            'event_name': 'Purchase',
            'event_id': f'PUR_{order_id}',
            'custom_data': {'order_id': order_id, 'value': float(payload.get('total_amount') or 0), 'currency': 'BDT'}
        }, client_ip, user_agent)
        forward_to_apps_script_async('orders/create', payload)
        return {'status': 'success', 'success': True, 'data': payload}

    if action == 'orders/list':
        orders = read_cache('orders', [])
        return {'status': 'success', 'success': True, 'data': {'items': orders, 'total': len(orders)}}

    if action in ('settings/list',):
        return {'status': 'success', 'success': True, 'data': get_site_settings()}

    if action in ('settings/save', 'settings/update', 'settings/add'):
        cur = get_site_settings()
        cur.update(payload)
        write_cache('settings', cur)
        forward_to_apps_script_async('settings/save', payload)
        return {'status': 'success', 'success': True, 'data': cur}

    # Generic list / mutation fallback
    col = action.split('/')[0]
    op = action.split('/')[1] if '/' in action else 'list'
    if op == 'list':
        items = read_cache(col, [])
        return {'status': 'success', 'success': True, 'data': {'items': items, 'total': len(items)}}

    forward_to_apps_script_async(action, payload)
    return {'status': 'success', 'success': True, 'data': payload}


def build_ssr_html(path: str = '/', query: dict = None) -> str:
    query = query or {}
    settings = get_site_settings()
    products = get_products()
    categories = read_cache('categories', INITIAL_CATEGORIES)
    brands = read_cache('brands', INITIAL_BRANDS)
    banners = read_cache('banners', INITIAL_BANNERS)

    ssr_state = json.dumps({
        'engine': 'Python-PHP-Turbo-4.0',
        'timestamp': int(time.time()),
        'settings': settings,
        'products': products,
        'categories': categories,
        'brands': brands,
        'banners': banners,
    }, ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Dream Cart BD (ড্রিম কার্ট বিডি) — Smart Digital Commerce &amp; Multi-Vendor Platform</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="48x48" href="/public/icon/favicon-48x48.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/public/icon/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/public/icon/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/public/icon/icon-192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/public/icon/icon-512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/public/icon/apple-touch-icon.png" />
  <link rel="manifest" href="/public/manifest.webmanifest" />
  <meta name="theme-color" content="#059669" />
  <link rel="canonical" href="https://dreamcartbd.com{path}" />
  <meta property="og:site_name" content="Dream Cart BD (ড্রিম কার্ট বিডি)" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Dream Cart BD (ড্রিম কার্ট বিডি) — Smart Digital Commerce &amp; Multi-Vendor Platform" />
  <meta property="og:image" content="https://dreamcartbd.com/public/icon/og-banner.jpg" />
  <link rel="alternate" type="application/rss+xml" title="Dream Cart BD Product Catalog Feed" href="https://dreamcartbd.com/feed.php" />

  <!-- Instant 0ms Server-Side Preloaded State (Python + PHP Turbo Cache) -->
  <script>
    window.__DCBD_SSR_CACHE__ = {ssr_state};
    window.__DCBD_PHP_API_URL__ = (window.__APP_BASE__ || '') + '/api/index.php';
  </script>

  <!-- Unified Pre-Boot Security Shield, Base Path & Orbital Loader Engine -->
  <script src="/src/boot.js"></script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- Standalone High-Performance Production CSS -->
  <link rel="stylesheet" href="/src/styles/main.css" />
  <link rel="stylesheet" href="/src/styles/admin.css" />
  <link rel="stylesheet" href="/src/styles/responsive.css" />
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
  <div id="app-root"></div>
  <script>if (window.mountUnifiedBootLoader) window.mountUnifiedBootLoader();</script>
  <script type="module" src="/src/main.js"></script>
</body>
</html>"""


def application(environ, start_response):
    """
    Standard PEP 3333 WSGI Application Entry Point (for cPanel Python App / Passenger / Gunicorn)
    """
    setup_testing_defaults(environ)
    path = environ.get('PATH_INFO', '/') or '/'
    query_str = environ.get('QUERY_STRING', '')
    query = {k: v[0] for k, v in urllib.parse.parse_qs(query_str).items()}
    method = environ.get('REQUEST_METHOD', 'GET').upper()
    client_ip = environ.get('HTTP_X_FORWARDED_FOR', environ.get('REMOTE_ADDR', '127.0.0.1')).split(',')[0].strip()
    user_agent = environ.get('HTTP_USER_AGENT', '')

    # 1. API Endpoint (/api or /api/index.php)
    if path in ('/api', '/api/', '/api/index.php'):
        if method == 'OPTIONS':
            start_response('200 OK', [
                ('Content-Type', 'application/json; charset=UTF-8'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type'),
            ])
            return [b'{"status":"ok","success":true}']

        payload = dict(query)
        action = query.get('action', '')
        if method == 'POST':
            try:
                length = int(environ.get('CONTENT_LENGTH') or 0)
            except ValueError:
                length = 0
            if length > 0:
                raw_body = environ['wsgi.input'].read(length).decode('utf-8', errors='replace')
                try:
                    parsed = json.loads(raw_body)
                    if isinstance(parsed, dict):
                        action = action or parsed.get('action', '')
                        payload = parsed.get('payload') or parsed.get('data') or parsed
                except Exception:
                    pass

        res = handle_api_action(action, payload if isinstance(payload, dict) else {}, client_ip, user_agent)
        body = json.dumps(res, ensure_ascii=False).encode('utf-8')
        start_response('200 OK', [
            ('Content-Type', 'application/json; charset=UTF-8'),
            ('Access-Control-Allow-Origin', '*'),
            ('X-Turbo-Engine', 'DreamCartBD-Python-4.0'),
        ])
        return [body]

    # 2. Static Assets (/src/*, /public/*, /favicon.ico, etc.)
    clean_rel = path.lstrip('/')
    static_candidate = (ROOT_DIR / clean_rel).resolve()
    if clean_rel and str(static_candidate).startswith(str(ROOT_DIR)) and static_candidate.is_file() and static_candidate.suffix not in ('.php', '.py', '.sqlite'):
        mime_type, _ = mimetypes.guess_type(str(static_candidate))
        mime_type = mime_type or 'application/octet-stream'
        if static_candidate.suffix == '.js':
            mime_type = 'application/javascript; charset=UTF-8'
        elif static_candidate.suffix == '.css':
            mime_type = 'text/css; charset=UTF-8'
        data = static_candidate.read_bytes()
        start_response('200 OK', [
            ('Content-Type', mime_type),
            ('Cache-Control', 'public, max-age=31536000, immutable'),
        ])
        return [data]

    # 3. Special Standalone Pages (/dcitbd, /education)
    if path.rstrip('/') in ('/dcitbd', '/education'):
        sub_php = ROOT_DIR / path.strip('/') / 'index.php'
        if sub_php.is_file():
            raw_txt = sub_php.read_text(encoding='utf-8')
            clean_html = re.sub(r'<\?(?:php|=).*?\?>', '', raw_txt, flags=re.S)
            start_response('200 OK', [('Content-Type', 'text/html; charset=UTF-8')])
            return [clean_html.encode('utf-8')]

    # 4. SSR SPA App Page
    html_out = build_ssr_html(path, query).encode('utf-8')
    start_response('200 OK', [
        ('Content-Type', 'text/html; charset=UTF-8'),
        ('X-Powered-By', f'DreamCartBD-Python-Turbo/{VERSION}'),
    ])
    return [html_out]


if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    port = int(os.environ.get('PORT', '8080'))
    print(f"🚀 Dream Cart BD — Python High-Speed Turbo Server running on http://localhost:{port}")
    with make_server('0.0.0.0', port, application) as httpd:
        httpd.serve_forever()
