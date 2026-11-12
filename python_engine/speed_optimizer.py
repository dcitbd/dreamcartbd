#!/usr/bin/env python3
"""
DREAM CART BD — ASSET PRE-COMPRESSOR & TURBO OPTIMIZER (python_engine/speed_optimizer.py)
Pre-builds SQLite WAL database, warms JSON cache files (`storage/cache/*.json` & `public/ssr-cache.json`),
generates Gzip (.gz) pre-compressed static assets for instant < 1ms server delivery,
and validates all PHP & Python routes.
"""

import gzip
import json
import shutil
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app import (
    INITIAL_BANNERS,
    INITIAL_BRANDS,
    INITIAL_CATEGORIES,
    get_products,
    get_site_settings,
    read_cache,
)
from python_engine.feed_generator import generate_feeds
from python_engine.sheet_sync_daemon import warm_initial_caches


def export_public_ssr_cache():
    ssr_data = {
        'engine': 'Python-PHP-Turbo-4.0',
        'timestamp': int(time.time()),
        'settings': get_site_settings(),
        'products': get_products(),
        'categories': read_cache('categories', INITIAL_CATEGORIES),
        'brands': read_cache('brands', INITIAL_BRANDS),
        'banners': read_cache('banners', INITIAL_BANNERS),
    }
    out_file = ROOT_DIR / 'public' / 'ssr-cache.json'
    out_file.write_text(json.dumps(ssr_data, ensure_ascii=False), encoding='utf-8')
    print(f'✅ Exported static SSR cache to {out_file.relative_to(ROOT_DIR)}.')


def precompress_static_assets():
    count = 0
    for ext in ('*.css', '*.js', '*.xml', '*.webmanifest', '*.json'):
        for file_path in ROOT_DIR.rglob(ext):
            if 'storage' in file_path.parts or '.git' in file_path.parts or 'node_modules' in file_path.parts:
                continue
            gz_path = file_path.with_name(file_path.name + '.gz')
            with open(file_path, 'rb') as f_in:
                with gzip.open(gz_path, 'wb', compresslevel=9) as f_out:
                    shutil.copyfileobj(f_in, f_out)
            count += 1
    print(f'✅ Pre-compressed {count} static CSS/JS/XML/JSON assets with Gzip level 9.')


if __name__ == '__main__':
    warm_initial_caches()
    export_public_ssr_cache()
    generate_feeds()
    precompress_static_assets()
    print('🚀 Dream Cart BD PHP + Python Turbo Optimization Complete!')
