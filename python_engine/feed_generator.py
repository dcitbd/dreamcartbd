#!/usr/bin/env python3
"""
DREAM CART BD — MULTI-PLATFORM AD CATALOG FEED & SITEMAP GENERATOR (python_engine/feed_generator.py)
Generates:
1. public/catalog-feed.xml (Google Merchant Center, YouTube Shopping Ads & Facebook/Instagram Commerce Manager XML Feed)
2. public/facebook-catalog.csv (Meta Commerce Manager CSV Product Catalog Feed)
3. sitemap.xml (Google Search Console Full Sitemap)
"""

import csv
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import quote
from xml.sax.saxutils import escape

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app import INITIAL_CATEGORIES, SITE_ORIGIN, get_products, read_cache


def generate_feeds():
    products = get_products()
    categories = read_cache('categories', INITIAL_CATEGORIES)
    now_rfc = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')
    today = datetime.utcnow().strftime('%Y-%m-%d')

    # 1. Generate XML Feed (public/catalog-feed.xml)
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        '    <title>Dream Cart BD (ড্রিম কার্ট বিডি) — Official Product Catalog Feed</title>',
        f'    <link>{SITE_ORIGIN}/</link>',
        '    <description>Official Product Feed for Facebook, Instagram, YouTube Shopping &amp; Google Merchant Center — Dream Cart BD.</description>',
        f'    <lastBuildDate>{now_rfc}</lastBuildDate>',
        f'    <atom:link href="{SITE_ORIGIN}/public/catalog-feed.xml" rel="self" type="application/rss+xml" />',
    ]

    csv_rows = [[
        'id', 'title', 'description', 'availability', 'condition', 'price', 'sale_price',
        'link', 'image_link', 'brand', 'google_product_category', 'product_type'
    ]]

    for idx, p in enumerate(products):
        if not isinstance(p, dict):
            continue
        sku = str(p.get('sku') or p.get('product_id') or f'DCBD-{idx+1}')
        name = str(p.get('name') or p.get('p_name') or 'Product')
        slug = str(p.get('slug') or sku.lower())
        desc = str(p.get('description') or f'{name} — Dream Cart BD.')
        brand = str(p.get('brand') or 'Dream Cart BD')
        cat = str(p.get('category') or 'General')
        sell = float(p.get('selling_price') or 0)
        orig = max(float(p.get('original_price') or sell), sell)
        stock = 'in stock' if int(p.get('stock', 25)) > 0 else 'preorder'
        thumb = str(p.get('thumbnail') or (p.get('images') or ['/public/icon/logo.png'])[0])
        if not thumb.startswith('http'):
            thumb = f"{SITE_ORIGIN}/{thumb.lstrip('/')}"
        link = f"{SITE_ORIGIN}/product/{quote(slug)}"

        xml_lines.extend([
            '    <item>',
            f'      <g:id>{escape(sku)}</g:id>',
            f'      <g:title>{escape(name)}</g:title>',
            f'      <g:description>{escape(desc)}</g:description>',
            f'      <g:link>{escape(link)}</g:link>',
            f'      <g:image_link>{escape(thumb)}</g:image_link>',
            f'      <g:brand>{escape(brand)}</g:brand>',
            '      <g:condition>new</g:condition>',
            f'      <g:availability>{escape(stock)}</g:availability>',
            f'      <g:price>{orig:.2f} BDT</g:price>',
            f'      <g:sale_price>{sell:.2f} BDT</g:sale_price>',
            f'      <g:product_type>{escape(cat)}</g:product_type>',
            '      <g:identifier_exists>no</g:identifier_exists>',
            '    </item>',
        ])

        csv_rows.append([
            sku, name, desc, stock, 'new', f'{orig:.2f} BDT', f'{sell:.2f} BDT',
            link, thumb, brand, 'Apparel & Accessories > Electronics', cat
        ])

    xml_lines.extend(['  </channel>', '</rss>'])
    (ROOT_DIR / 'public' / 'catalog-feed.xml').write_text('\n'.join(xml_lines), encoding='utf-8')

    with open(ROOT_DIR / 'public' / 'facebook-catalog.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(csv_rows)

    print(f'✅ Generated XML & CSV Ad Catalog Feeds ({len(products)} products) for Facebook, Instagram, YouTube & Google.')


if __name__ == '__main__':
    generate_feeds()
