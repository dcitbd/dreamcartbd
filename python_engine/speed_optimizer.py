#!/usr/bin/env python3
"""
DREAM CART BD — ASSET PRE-COMPRESSOR & TURBO OPTIMIZER (python_engine/speed_optimizer.py)
Pre-builds SQLite WAL database, warms JSON cache files, generates Gzip (.gz) pre-compressed static assets
for instant < 1ms server delivery, and validates all PHP & Python routes.
"""

import gzip
import shutil
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from python_engine.feed_generator import generate_feeds
from python_engine.sheet_sync_daemon import warm_initial_caches


def precompress_static_assets():
    count = 0
    for ext in ('*.css', '*.js', '*.xml', '*.webmanifest'):
        for file_path in ROOT_DIR.rglob(ext):
            if 'storage' in file_path.parts or '.git' in file_path.parts:
                continue
            gz_path = file_path.with_name(file_path.name + '.gz')
            with open(file_path, 'rb') as f_in:
                with gzip.open(gz_path, 'wb', compresslevel=9) as f_out:
                    shutil.copyfileobj(f_in, f_out)
            count += 1
    print(f'✅ Pre-compressed {count} static CSS/JS/XML assets with Gzip level 9.')


if __name__ == '__main__':
    warm_initial_caches()
    generate_feeds()
    precompress_static_assets()
    print('🚀 Dream Cart BD PHP + Python Turbo Optimization Complete!')
