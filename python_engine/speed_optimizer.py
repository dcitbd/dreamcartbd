#!/usr/bin/env python3
"""
DREAM CART BD — ASSET PRE-COMPRESSOR, DUPLICATE HTML CLEANER & TURBO OPTIMIZER (python_engine/speed_optimizer.py)
- Pre-builds SQLite WAL database & warms JSON cache files (`storage/cache/*.json` & `public/ssr-cache.json`)
- Removes duplicate static `index.html` / `404.html` files that shadow live `index.php` / `404.php` on Apache/LiteSpeed cPanel servers
- Ensures all route directories use the shared `dcbd_render_app_page()` entry point (Write-Once-Reuse-Everywhere)
- Generates XML/CSV product catalog feeds (`/public/catalog-feed.xml` & `.csv`) for Facebook & Google Merchant Center Ads
- Pre-compresses static CSS/JS/XML/JSON assets in `public/` and `src/` with Gzip level 9
"""

import gzip
import json
import os
import re
import shutil
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app import (
    DEFAULT_DELIVERY_METHODS,
    DEFAULT_OFFERS,
    DEFAULT_PAYMENT_METHODS,
    INITIAL_BANNERS,
    INITIAL_BRANDS,
    INITIAL_CATEGORIES,
    META_PATH,
    get_orders,
    get_products,
    get_site_settings,
    get_sync_meta,
    now_ms,
    read_cache,
)
from python_engine.feed_generator import generate_feeds
from python_engine.sheet_sync_daemon import warm_initial_caches


def export_public_ssr_cache():
    meta = get_sync_meta()
    ssr_data = {
        'engine': 'Python-PHP-Turbo-5.5',
        'timestamp': now_ms(),
        'sync_updated_at': int(meta.get('updated_at') or meta.get('version_ts') or 0),
        'collections_meta': meta.get('collections') or {},
        'settings': get_site_settings(),
        'products': get_products(),
        'product_overrides': read_cache('product_overrides', {}),
        'deleted_products': read_cache('deleted_products', []),
        'deleted_orders': read_cache('deleted_orders', []),
        'categories': read_cache('categories', INITIAL_CATEGORIES),
        'brands': read_cache('brands', INITIAL_BRANDS),
        'banners': read_cache('banners', INITIAL_BANNERS),
        'payment_methods': read_cache('payment_method', DEFAULT_PAYMENT_METHODS),
        'delivery_methods': read_cache('delivery_area', DEFAULT_DELIVERY_METHODS),
        'offers': read_cache('offer_or_coupon', DEFAULT_OFFERS),
        'landing_pages': read_cache('landing_pages', []),
        'orders': get_orders(False)[:250],
    }
    out_file = ROOT_DIR / 'public' / 'ssr-cache.json'
    out_file.write_text(json.dumps(ssr_data, ensure_ascii=False), encoding='utf-8')
    print(f'✅ Exported static SSR cache to {out_file.relative_to(ROOT_DIR)}.')


def remove_duplicate_html_shadow_files():
    """
    Removes duplicate `index.html` and `404.html` files that sit alongside `index.php` and `404.php`
    and shadow live PHP SSR + Pixel injection on Apache/LiteSpeed cPanel servers.
    """
    removed = 0
    for html_file in list(ROOT_DIR.rglob('*.html')):
        php_sibling = html_file.with_suffix('.php')
        if php_sibling.is_file():
            try:
                html_file.unlink()
                removed += 1
            except Exception:
                pass
    if removed:
        print(f'🧹 Removed {removed} duplicate .html files that shadowed .php entry points.')


def standardize_modular_php_routes():
    """
    Ensures every route directory uses the shared 2-line `dcbd_render_app_page()` helper from `includes/bootstrap.php`
    and adds missing route directories so direct browser refreshes never 404.
    """
    extra_routes = [
        'admin/addlanding',
        'admin/category',
        'admin/categories',
        'admin/add-product',
        'admin/add-order',
        'admin/add-brand',
    ]
    for rel in extra_routes:
        route_dir = ROOT_DIR / rel
        route_dir.mkdir(parents=True, exist_ok=True)
        depth = len(Path(rel).parts)
        rel_inc = '../' * depth + 'includes/bootstrap.php'
        php_code = f"<?php\nrequire_once __DIR__ . '/{rel_inc}';\ndcbd_render_app_page('/{rel}');\n"
        (route_dir / 'index.php').write_text(php_code, encoding='utf-8')
    print('✅ Standardized all route index.php files to use shared includes/bootstrap.php.')


def cleanup_non_asset_gzip_files():
    """Removes redundant .gz files from apps-script/ and root config files."""
    removed = 0
    for gz_file in ROOT_DIR.rglob('*.gz'):
        rel_parts = gz_file.relative_to(ROOT_DIR).parts
        if not rel_parts or rel_parts[0] not in ('public', 'src'):
            try:
                gz_file.unlink()
                removed += 1
            except Exception:
                pass
    if removed:
        print(f'🧹 Cleaned up {removed} redundant .gz files outside public/ and src/.')


def precompress_static_assets():
    cleanup_non_asset_gzip_files()
    count = 0
    for target_dir in (ROOT_DIR / 'public', ROOT_DIR / 'src'):
        if not target_dir.is_dir():
            continue
        for ext in ('*.css', '*.js', '*.xml', '*.webmanifest', '*.json'):
            for file_path in target_dir.rglob(ext):
                gz_path = file_path.with_name(file_path.name + '.gz')
                with open(file_path, 'rb') as f_in:
                    with gzip.open(gz_path, 'wb', compresslevel=9) as f_out:
                        shutil.copyfileobj(f_in, f_out)
                count += 1
    print(f'✅ Pre-compressed {count} static CSS/JS/XML/JSON assets in public/ & src/ with Gzip level 9.')


def run_all():
    warm_initial_caches()
    remove_duplicate_html_shadow_files()
    standardize_modular_php_routes()
    export_public_ssr_cache()
    generate_feeds()
    precompress_static_assets()
    print('🚀 Dream Cart BD PHP + Python Turbo Optimization Complete!')


if __name__ == '__main__':
    run_all()
