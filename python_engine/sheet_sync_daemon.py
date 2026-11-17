#!/usr/bin/env python3
"""
DREAM CART BD — MULTI-THREADED GOOGLE SHEETS 20-TAB SYNC & CACHE WARMER (python_engine/sheet_sync_daemon.py)
Synchronizes all 20 Google Sheets into local JSON cache (`storage/cache/*.json`) and SQLite (`storage/dreamcartbd.sqlite`)
so both PHP (`api/index.php`) and Python (`app.py`) serve every request in < 0.5ms!
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app import (
    DEFAULT_DELIVERY_METHODS,
    DEFAULT_OFFERS,
    DEFAULT_PAYMENT_METHODS,
    DEFAULT_SETTINGS,
    INITIAL_BANNERS,
    INITIAL_BRANDS,
    INITIAL_CATEGORIES,
    INITIAL_PRODUCTS,
    SPREADSHEET_ID,
    deduplicate_and_sort_orders,
    read_cache,
    write_cache,
)

SHEETS_TO_SYNC = {
    'products': ('Products', 'SELECT A,B,C,D,E,F,G,H,I,J,K,L,M,N,R,S,T,U,V,W'),
    'categories': ('Categories', ''),
    'brands': ('Brands', ''),
    'banners': ('Banners', ''),
    'orders': ('Orders', ''),
    'incomplete_orders': ('Incomplete_Orders', ''),
    'customers': ('Customers', ''),
    'resellers': ('Resellers', ''),
    'wholesalers': ('Wholesalers', ''),
    'sellers': ('Sellers', ''),
    'markets': ('Others_Market', ''),
    'reviews': ('Reviews', ''),
    'landing_pages': ('Landing-Pages', ''),
    'payment_method': ('Payment_Method', ''),
    'delivery_area': ('Delivery_Area', ''),
    'offer_or_coupon': ('Offer_or_Coupon', ''),
    'buying': ('Buying', ''),
    'costs': ('Costs', ''),
    'invest': ('Invest', ''),
    'payments': ('Payments', ''),
}


def fetch_gviz_sheet(sheet_name: str, tq: str = '', timeout: int = 6) -> list:
    url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet={urllib.parse.quote(sheet_name)}&headers=1"
    if tq:
        url += f"&tq={urllib.parse.quote(tq)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'DreamCartBD-PythonSync/5.5'})
    raw = urllib.request.urlopen(req, timeout=timeout).read().decode('utf-8', errors='replace')
    m = re.search(r'setResponse\((.*)\)\s*;?\s*$', raw, re.S)
    if not m:
        return []
    resp = json.loads(m.group(1))
    table = resp.get('table') or {}
    cols = [str((c or {}).get('label') or '').strip() for c in (table.get('cols') or [])]
    raw_rows = table.get('rows') or []

    rows = []
    for r in raw_rows:
        cells = (r or {}).get('c') or []
        row_obj = {}
        has_data = False
        for idx, cell in enumerate(cells):
            col_name = cols[idx] if idx < len(cols) and cols[idx] else f'col_{idx}'
            key = re.sub(r'[^a-z0-9_]', '_', col_name.lower())
            val = ''
            if isinstance(cell, dict):
                if isinstance(cell.get('v'), (int, float, bool)):
                    val = cell['v']
                elif cell.get('f'):
                    val = str(cell['f']).strip()
                elif cell.get('v') is not None:
                    val = str(cell['v']).strip()
            row_obj[key] = val
            row_obj[col_name] = val
            row_obj[f'col_{idx}'] = val
            if val not in ('', False):
                has_data = True
        if has_data:
            rows.append(row_obj)
    return rows


def warm_initial_caches():
    """Seeds initial local SQLite & JSON cache files without overwriting existing live data."""
    if not read_cache('settings', None):
        write_cache('settings', DEFAULT_SETTINGS)
    if not read_cache('products', None):
        write_cache('products', INITIAL_PRODUCTS)
    if not read_cache('categories', None):
        write_cache('categories', INITIAL_CATEGORIES)
    if not read_cache('brands', None):
        write_cache('brands', INITIAL_BRANDS)
    if not read_cache('banners', None):
        write_cache('banners', INITIAL_BANNERS)
    if not read_cache('payment_method', None):
        write_cache('payment_method', DEFAULT_PAYMENT_METHODS)
    if not read_cache('delivery_area', None):
        write_cache('delivery_area', DEFAULT_DELIVERY_METHODS)
    if not read_cache('offer_or_coupon', None):
        write_cache('offer_or_coupon', DEFAULT_OFFERS)
    print('✅ Warmed local SQLite & JSON caches with initial seed catalog.')


def sync_all_sheets_once():
    print(f'🔄 Syncing 20 Google Sheets from Spreadsheet ID: {SPREADSHEET_ID}...')
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {
            pool.submit(fetch_gviz_sheet, sheet_name, tq): key
            for key, (sheet_name, tq) in SHEETS_TO_SYNC.items()
        }
        for fut in as_completed(futures):
            key = futures[fut]
            try:
                rows = fut.result()
                if isinstance(rows, list) and len(rows) > 0:
                    if key == 'orders':
                        for i, r in enumerate(rows):
                            if isinstance(r, dict):
                                r['_sheet_row_idx'] = i + 2
                        rows.reverse()
                        existing = read_cache('orders', [])
                        rows = deduplicate_and_sort_orders((existing if isinstance(existing, list) else []) + rows)
                    write_cache(key, rows)
                    print(f'  ✔ Synced [{key}]: {len(rows)} rows')
            except Exception as e:
                print(f'  ⚠ Offline/Skipped [{key}]: using local cache ({e})')


if __name__ == '__main__':
    warm_initial_caches()
    if '--daemon' in sys.argv:
        while True:
            sync_all_sheets_once()
            time.sleep(60)
    elif '--warm-only' not in sys.argv:
        sync_all_sheets_once()
