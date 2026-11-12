/**
 * DREAM CART BD — UNIFIED PRE-BOOT ENGINE, SECURITY SHIELD & ORBITAL LOADER (src/boot.js)
 * Written once and reused across all HTML entry points and LoadingSkeleton.js:
 * 1. Instant Security Shield (F12 / DevTools / Console / View-Source / Right-Click Lock)
 * 2. Universal Dynamic Base Path Calculation (Domain, GitHub Pages, Cloudflare, cPanel)
 * 3. Shared Orbital Particle Vortex Canvas Engine (window.startOrbitalParticleCanvas)
 * 4. Unified Single-Instance Center Logo Loader (window.mountUnifiedBootLoader)
 */
(function() {
  // 1. Lock Console & Block F12 / Ctrl+Shift+I / Ctrl+U / Right-Click
  try {
    var noop = function() {};
    if (window.console) {
      ['log','info','warn','error','debug','table','dir','trace'].forEach(function(m) {
        try { window.console[m] = noop; } catch(e) {}
      });
    }
    window.addEventListener('keydown', function(e) {
      var k = (e.key || '').toUpperCase();
      var c = e.keyCode || e.which;
      if (c === 123 || k === 'F12' ||
          (e.ctrlKey && e.shiftKey && ['I','J','C','K'].indexOf(k) !== -1) ||
          (e.metaKey && e.altKey && ['I','J','C','K','U'].indexOf(k) !== -1) ||
          ((e.ctrlKey || e.metaKey) && (k === 'U' || k === 'S' || c === 85 || c === 83))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    }, true);
  } catch(e) {}

  // 2. Dynamic Base Path Calculation for Universal Hosting (Domain, GitHub Pages, Cloudflare, cPanel)
  var currentPath = window.location.pathname;
  var base = '/';
  if (window.location.hostname.includes('github.io')) {
    var segments = currentPath.split('/').filter(Boolean);
    var knownRoutes = [
      'products', 'shop', 'product', 'cart', 'favourite', 'wishlist',
      'checkout', 'order', 'order-success', 'track', 'tracking', 'contact', 'offers',
      'categories', 'brands', 'others-market', 'chat', 'live-chat',
      'landing', 'terms', 'privacy', 'customer', 'reseller', 'wholesaler', 'admin', 'login', 'register', 'dcitbd', 'education'
    ];
    if (segments.length > 0 && !knownRoutes.includes(segments[0].toLowerCase())) {
      base = '/' + segments[0] + '/';
    }
  }
  window.__APP_BASE__ = base === '/' ? '' : base.replace(/\/$/, '');
  if (document.head && !document.querySelector('base')) {
    var baseTag = document.createElement('base');
    baseTag.href = base;
    document.head.insertBefore(baseTag, document.head.firstChild);
  }

  // 2.5 Universal Logo & Icon Path Resolver + Automatic Multi-Path Fallback Engine
  var appBase = window.__APP_BASE__ || '';
  window.DCBD_LOGO_URL = appBase + '/public/icon/logo.png';
  window.DCBD_LOGO_ALT_URL = appBase + '/icon/logo.png';

  window.getDcbdLogoUrl = function(customUrl) {
    var b = window.__APP_BASE__ || '';
    var defaultLogo = b + '/public/icon/logo.png';
    if (!customUrl || typeof customUrl !== 'string') return defaultLogo;
    var u = customUrl.trim();
    if (!u || u === 'null' || u === 'undefined' || u === 'logo.png' || u.indexOf('encrypted-tbn') !== -1 || u.indexOf('jijistatic') !== -1) {
      return defaultLogo;
    }
    if (u === '/public/icon/logo.png' || u === 'public/icon/logo.png' || u === './public/icon/logo.png') {
      return defaultLogo;
    }
    if (u === '/icon/logo.png' || u === 'icon/logo.png' || u === './icon/logo.png') {
      return b + '/icon/logo.png';
    }
    if (b && u.indexOf('/public/') === 0) {
      return b + u;
    }
    return u;
  };

  window.handleDcbdLogoError = function(img) {
    if (!img || img.tagName !== 'IMG') return;
    var b = window.__APP_BASE__ || '';
    var fallbacks = [
      b + '/public/icon/logo.png',
      b + '/icon/logo.png',
      '/public/icon/logo.png',
      '/icon/logo.png',
      'public/icon/logo.png',
      'icon/logo.png',
      '../public/icon/logo.png',
      '../icon/logo.png',
      '../../public/icon/logo.png',
      '../../icon/logo.png',
      b + '/public/icon/icon-192.png',
      b + '/icon/icon-192.png',
      b + '/favicon.ico',
      '/favicon.ico',
      'favicon.ico'
    ];
    var idx = typeof img.__dcbdLogoRetryIdx === 'number' ? img.__dcbdLogoRetryIdx : 0;
    var currentAttr = img.getAttribute('src') || '';
    while (idx < fallbacks.length && (fallbacks[idx] === currentAttr || fallbacks[idx] === img.src)) {
      idx++;
    }
    if (idx < fallbacks.length) {
      img.__dcbdLogoRetryIdx = idx + 1;
      img.style.display = '';
      img.src = fallbacks[idx];
    }
  };

  // Global capture-phase listener so ANY broken logo/icon image anywhere in the DOM automatically recovers
  window.addEventListener('error', function(e) {
    var t = e && e.target;
    if (!t || t.tagName !== 'IMG') return;
    var rawSrc = (t.getAttribute('src') || t.src || '').toLowerCase();
    var altTxt = (t.getAttribute('alt') || '').toLowerCase();
    var clsTxt = (t.className || '').toLowerCase();
    if (
      rawSrc.indexOf('logo') !== -1 ||
      rawSrc.indexOf('/public/icon/') !== -1 ||
      rawSrc.indexOf('/icon/') !== -1 ||
      rawSrc.indexOf('favicon') !== -1 ||
      altTxt.indexOf('logo') !== -1 ||
      altTxt.indexOf('dream cart') !== -1 ||
      clsTxt.indexOf('logo') !== -1
    ) {
      window.handleDcbdLogoError(t);
    }
  }, true);

  // Prefix window.__APP_BASE__ on static /public/icon/ links and images when hosted on a subpath
  function normalizeSubpathAssets(rootNode) {
    var b = window.__APP_BASE__ || '';
    if (!b || !rootNode || !rootNode.querySelectorAll) return;
    var imgs = rootNode.querySelectorAll('img[src^="/public/"], img[src^="/icon/"], img[src="/favicon.ico"]');
    for (var i = 0; i < imgs.length; i++) {
      var s = imgs[i].getAttribute('src');
      if (s && s.indexOf(b + '/') !== 0) imgs[i].setAttribute('src', b + s);
    }
    var links = rootNode.querySelectorAll('link[href^="/public/"], link[href^="/icon/"], link[href="/favicon.ico"]');
    for (var j = 0; j < links.length; j++) {
      var h = links[j].getAttribute('href');
      if (h && h.indexOf(b + '/') !== 0) links[j].setAttribute('href', b + h);
    }
  }
  if (document.head) normalizeSubpathAssets(document.head);
  if (document.readyState !== 'loading') normalizeSubpathAssets(document);
  else document.addEventListener('DOMContentLoaded', function() { normalizeSubpathAssets(document); });
  if (window.__APP_BASE__ && typeof MutationObserver !== 'undefined') {
    try {
      var subObs = new MutationObserver(function() { normalizeSubpathAssets(document); });
      if (document.documentElement) subObs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  // 3. Inject Default Google Search Structured Data (JSON-LD) if not already in <head>
  if (document.head && !document.getElementById('dcbd-dynamic-jsonld')) {
    try {
      var jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'dcbd-dynamic-jsonld';
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.textContent = "{\"@context\": \"https://schema.org\", \"@graph\": [{\"@type\": [\"Organization\", \"OnlineStore\"], \"@id\": \"https://dreamcartbd.com/#organization\", \"name\": \"Dream Cart BD\", \"alternateName\": [\"ড্রিম কার্ট বিডি\", \"ড্রিম কার্ট বি.ডি\", \"DreamCart BD\", \"Dream Cart Bangladesh\"], \"url\": \"https://dreamcartbd.com/\", \"logo\": {\"@type\": \"ImageObject\", \"@id\": \"https://dreamcartbd.com/#logo\", \"url\": \"https://dreamcartbd.com/public/icon/logo.png\", \"contentUrl\": \"https://dreamcartbd.com/public/icon/logo.png\", \"width\": 832, \"height\": 832, \"caption\": \"Dream Cart BD Official Logo\"}, \"image\": [\"https://dreamcartbd.com/public/icon/logo.png\", \"https://dreamcartbd.com/public/icon/og-banner.jpg\"], \"description\": \"Dream Cart BD (ড্রিম কার্ট বিডি) বাংলাদেশের বিশ্বস্ত স্মার্ট ডিজিটাল ই-কমার্স ও মাল্টি-ভেন্ডর প্ল্যাটফর্ম।\", \"telephone\": \"+8801581703822\", \"email\": \"jainal.dcitbd@gmail.com\", \"address\": {\"@type\": \"PostalAddress\", \"streetAddress\": \"চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ\", \"addressLocality\": \"কুমিল্লা\", \"postalCode\": \"3500\", \"addressCountry\": \"BD\"}, \"sameAs\": [\"https://www.facebook.com/dreamcartbd\", \"https://dcitbd.github.io/dcitbd/\"]}, {\"@type\": \"WebSite\", \"@id\": \"https://dreamcartbd.com/#website\", \"url\": \"https://dreamcartbd.com/\", \"name\": \"Dream Cart BD — ড্রিম কার্ট বিডি\", \"alternateName\": [\"Dream Cart BD\", \"ড্রিম কার্ট বিডি\", \"ড্রিম কার্ট বি.ডি\", \"DreamCart BD\"], \"publisher\": {\"@id\": \"https://dreamcartbd.com/#organization\"}, \"inLanguage\": \"bn-BD\", \"potentialAction\": {\"@type\": \"SearchAction\", \"target\": {\"@type\": \"EntryPoint\", \"urlTemplate\": \"https://dreamcartbd.com/products?search={search_term_string}\"}, \"query-input\": \"required name=search_term_string\"}}, {\"@type\": \"ItemList\", \"@id\": \"https://dreamcartbd.com/#sitelinks\", \"name\": \"Dream Cart BD Official Sitelinks\", \"itemListElement\": [{\"@type\": \"SiteNavigationElement\", \"position\": 1, \"name\": \"হোমপেজ — Dream Cart BD\", \"url\": \"https://dreamcartbd.com/\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 2, \"name\": \"প্রোডাক্ট’স পেজ (All Products)\", \"url\": \"https://dreamcartbd.com/products\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 3, \"name\": \"কাস্টমার লগইন (Customer Login)\", \"url\": \"https://dreamcartbd.com/customer/login\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 4, \"name\": \"রিসেলার লগইন (Reseller Login)\", \"url\": \"https://dreamcartbd.com/reseller/login\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 5, \"name\": \"হোলসেলার লগইন (Wholesaler Login)\", \"url\": \"https://dreamcartbd.com/wholesaler/login\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 6, \"name\": \"পার্সেল ট্র্যাক করুন (Track Parcel)\", \"url\": \"https://dreamcartbd.com/track\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 7, \"name\": \"কন্টাক্ট করুন (Contact Us)\", \"url\": \"https://dreamcartbd.com/contact\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 8, \"name\": \"আইটি সার্ভিসেস (IT Services)\", \"url\": \"https://dreamcartbd.com/dcitbd\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 9, \"name\": \"শিখুন ও ক্যারিয়ার গড়ুন (Learn & Career)\", \"url\": \"https://dreamcartbd.com/education\"}, {\"@type\": \"SiteNavigationElement\", \"position\": 10, \"name\": \"ক্যাটাগরি সমূহ (All Categories)\", \"url\": \"https://dreamcartbd.com/categories\"}]}, {\"@type\": \"ItemList\", \"@id\": \"https://dreamcartbd.com/#categories\", \"name\": \"Dream Cart BD Categories (ক্যাটাগরি ওয়াইজ লিংক ও ছবি)\", \"itemListElement\": [{\"@type\": \"ListItem\", \"position\": 1, \"item\": {\"@type\": \"CollectionPage\", \"name\": \"Smartwatches (স্মার্টওয়াচ ও গ্যাজেট) — Dream Cart BD\", \"url\": \"https://dreamcartbd.com/products?cat=Smartwatches\", \"image\": \"https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80\"}}, {\"@type\": \"ListItem\", \"position\": 2, \"item\": {\"@type\": \"CollectionPage\", \"name\": \"Kitchen (স্মার্ট কিচেন ও গ্যাস সেফটি) — Dream Cart BD\", \"url\": \"https://dreamcartbd.com/products?cat=Kitchen\", \"image\": \"https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80\"}}, {\"@type\": \"ListItem\", \"position\": 3, \"item\": {\"@type\": \"CollectionPage\", \"name\": \"Organic & Health (অর্গানিক ফুড ও ন্যাচারাল হেলথ) — Dream Cart BD\", \"url\": \"https://dreamcartbd.com/products?cat=Organic%20%26%20Health\", \"image\": \"https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&q=80\"}}, {\"@type\": \"ListItem\", \"position\": 4, \"item\": {\"@type\": \"CollectionPage\", \"name\": \"Home Appliances (হোম অ্যাপ্লায়েন্স ও ইলেকট্রনিক্স) — Dream Cart BD\", \"url\": \"https://dreamcartbd.com/products?cat=Home%20Appliances\", \"image\": \"https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80\"}}, {\"@type\": \"ListItem\", \"position\": 5, \"item\": {\"@type\": \"CollectionPage\", \"name\": \"Medicine & Healthcare (মেডিসিন ও হেলথকেয়ার ডিভাইস) — Dream Cart BD\", \"url\": \"https://dreamcartbd.com/products?cat=Medicine%20%26%20Healthcare\", \"image\": \"https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80\"}}, {\"@type\": \"ListItem\", \"position\": 6, \"item\": {\"@type\": \"CollectionPage\", \"name\": \"Stationery (প্রিমিয়াম স্টেশনারি ও অফিস ডেস্ক) — Dream Cart BD\", \"url\": \"https://dreamcartbd.com/products?cat=Stationery\", \"image\": \"https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80\"}}]}, {\"@type\": \"ItemList\", \"@id\": \"https://dreamcartbd.com/#featured-products\", \"name\": \"Dream Cart BD Popular Products\", \"itemListElement\": [{\"@type\": \"ListItem\", \"position\": 1, \"item\": {\"@type\": \"Product\", \"name\": \"Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS\", \"sku\": \"DCBD-WT-01\", \"url\": \"https://dreamcartbd.com/product/amazfit-gts-4-smartwatch\", \"image\": \"https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80\", \"description\": \"Amazfit GTS 4 features a 1.75 inch AMOLED display, dual-band GPS, 150+ sports modes & Bluetooth calling. Order from Dream Cart BD.\", \"brand\": {\"@type\": \"Brand\", \"name\": \"Amazfit\"}, \"offers\": {\"@type\": \"Offer\", \"url\": \"https://dreamcartbd.com/product/amazfit-gts-4-smartwatch\", \"priceCurrency\": \"BDT\", \"price\": \"8490\", \"availability\": \"https://schema.org/InStock\", \"itemCondition\": \"https://schema.org/NewCondition\"}}}, {\"@type\": \"ListItem\", \"position\": 2, \"item\": {\"@type\": \"Product\", \"name\": \"অটো গ্যাস সেফটি ডিভাইস ও লিকেজ প্রোটেক্টর (Heavy Duty)\", \"sku\": \"DCBD-GS-02\", \"url\": \"https://dreamcartbd.com/product/auto-gas-safety-device-heavy-duty\", \"image\": \"https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80\", \"description\": \"সিলিন্ডার ও লাইনের গ্যাস লিকেজ স্বয়ংক্রিয়ভাবে বন্ধ করে রান্নাঘরকে রাখে ১০০% নিরাপদ। ২ বছরের অফিসিয়াল ওয়ারেন্টি — Dream Cart BD।\", \"brand\": {\"@type\": \"Brand\", \"name\": \"HK\"}, \"offers\": {\"@type\": \"Offer\", \"url\": \"https://dreamcartbd.com/product/auto-gas-safety-device-heavy-duty\", \"priceCurrency\": \"BDT\", \"price\": \"2450\", \"availability\": \"https://schema.org/InStock\", \"itemCondition\": \"https://schema.org/NewCondition\"}}}, {\"@type\": \"ListItem\", \"position\": 3, \"item\": {\"@type\": \"Product\", \"name\": \"সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু (১ কেজি জার)\", \"sku\": \"DCBD-HN-03\", \"url\": \"https://dreamcartbd.com/product/sundarban-natural-raw-honey-1kg\", \"image\": \"https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=80\", \"description\": \"সরাসরি বাওয়ালিদের মাধ্যমে সংগৃহীত ১০০% ভেজালমুক্ত সুন্দরবনের খলিশা ফুলের প্রাকৃতিক চাকের মধু (১ কেজি) — Dream Cart BD।\", \"brand\": {\"@type\": \"Brand\", \"name\": \"Dream Organic\"}, \"offers\": {\"@type\": \"Offer\", \"url\": \"https://dreamcartbd.com/product/sundarban-natural-raw-honey-1kg\", \"priceCurrency\": \"BDT\", \"price\": \"1250\", \"availability\": \"https://schema.org/InStock\", \"itemCondition\": \"https://schema.org/NewCondition\"}}}, {\"@type\": \"ListItem\", \"position\": 4, \"item\": {\"@type\": \"Product\", \"name\": \"মিলিটারি রিচার্জেবল জুম ফ্ল্যাশলাইট ৩০০০ লুমেন\", \"sku\": \"DCBD-FL-04\", \"url\": \"https://dreamcartbd.com/product/military-rechargeable-flashlight-3000lm\", \"image\": \"https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80\", \"description\": \"অ্যালুমিনিয়াম অ্যালয় বডি, লং-রেঞ্জ জুম বিম এবং টাইপ-সি ফাস্ট চার্জিং সুবিধাযুক্ত ট্যাকটিক্যাল টর্চ — Dream Cart BD।\", \"brand\": {\"@type\": \"Brand\", \"name\": \"HK\"}, \"offers\": {\"@type\": \"Offer\", \"url\": \"https://dreamcartbd.com/product/military-rechargeable-flashlight-3000lm\", \"priceCurrency\": \"BDT\", \"price\": \"1450\", \"availability\": \"https://schema.org/InStock\", \"itemCondition\": \"https://schema.org/NewCondition\"}}}, {\"@type\": \"ListItem\", \"position\": 5, \"item\": {\"@type\": \"Product\", \"name\": \"প্রিমিয়াম অর্গানিক চিয়া সিড (৫০০ গ্রাম এয়ারটাইট জার)\", \"sku\": \"DCBD-CH-05\", \"url\": \"https://dreamcartbd.com/product/premium-organic-chia-seed-500g\", \"image\": \"https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80\", \"description\": \"ওমেগা-৩, ফাইবার ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ বাছাইকৃত প্রিমিয়াম চিয়া সিড (৫০০ গ্রাম) — Dream Cart BD।\", \"brand\": {\"@type\": \"Brand\", \"name\": \"Dream Organic\"}, \"offers\": {\"@type\": \"Offer\", \"url\": \"https://dreamcartbd.com/product/premium-organic-chia-seed-500g\", \"priceCurrency\": \"BDT\", \"price\": \"650\", \"availability\": \"https://schema.org/InStock\", \"itemCondition\": \"https://schema.org/NewCondition\"}}}]}]}";
      document.head.appendChild(jsonLdScript);
    } catch (e) {}
  }

  // 4. Shared Orbital Particle Vortex Canvas Engine (Used by both Boot Loader & LoadingSkeleton.js)
  function startOrbitalParticleCanvas(c) {
    if (!c || c.__dcbdParticleRunning) return;
    c.__dcbdParticleRunning = true;
    var ctx = c.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = 220;
    c.width = size * dpr;
    c.height = size * dpr;
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2, r = 64;
    var pts = [], ang = -Math.PI / 2, hue = 155;
    function step() {
      if (!document.body || !document.body.contains(c)) { c.__dcbdParticleRunning = false; return; }
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ang += 0.075;
      hue = (hue + 1.4) % 360;
      var hx = cx + Math.cos(ang) * r, hy = cy + Math.sin(ang) * r;
      for (var k = 0; k < 3; k++) {
        pts.push({
          x: hx + (Math.random() - 0.5) * 6,
          y: hy + (Math.random() - 0.5) * 6,
          a: ang + Math.PI / 2 + (Math.random() - 0.5) * 0.35,
          s: 0.35 + Math.random() * 0.55,
          ac: 1.018 + Math.random() * 0.008,
          l: 1.0,
          d: 0.014 + Math.random() * 0.012,
          rad: 1.6 + Math.random() * 2.1,
          h: (hue + k * 18) % 360
        });
      }
      for (var i = pts.length - 1; i >= 0; i--) {
        var p = pts[i];
        p.s *= p.ac;
        p.x += Math.cos(p.a) * p.s;
        p.y += Math.sin(p.a) * p.s;
        p.a += Math.PI / 52;
        p.l -= p.d;
        if (p.l <= 0) { pts.splice(i, 1); continue; }
        for (var j = i - 1; j >= Math.max(0, i - 8); j--) {
          var p2 = pts[j];
          var dx = p.x - p2.x, dy = p.y - p2.y, d2 = dx * dx + dy * dy;
          if (d2 < 480) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'hsla(' + p.h + ',92%,60%,' + (Math.min(p.l, p2.l) * (1 - d2 / 480) * 0.48) + ')';
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.rad * p.l, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + p.h + ',95%,62%,' + (p.l * 0.92) + ')';
        ctx.fill();
      }
      var g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14);
      g.addColorStop(0, 'rgba(255,255,255,0.98)');
      g.addColorStop(0.35, 'hsla(' + hue + ',95%,65%,0.85)');
      g.addColorStop(1, 'hsla(' + hue + ',95%,55%,0)');
      ctx.beginPath();
      ctx.arc(hx, hy, 14, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  window.startOrbitalParticleCanvas = startOrbitalParticleCanvas;

  // 5. Unified Single-Instance Orbital Particle & Center Logo Loader Mounter
  window.mountUnifiedBootLoader = function() {
    var root = document.getElementById('app-root');
    if (!root || document.getElementById('dcbd-unified-loader')) return;
    root.innerHTML = `<div id="dcbd-unified-loader" style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); color: #f8fafc; user-select: none; padding: 16px;">
      <style>
        @keyframes dcbdCenterLogoFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 28px rgba(16, 185, 129, 0.38), inset 0 0 12px rgba(16, 185, 129, 0.15); }
          50% { transform: translate(-50%, -50%) scale(1.06); box-shadow: 0 0 42px rgba(6, 182, 212, 0.55), inset 0 0 16px rgba(16, 185, 129, 0.25); }
        }
        @keyframes dcbdBarShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      </style>
      <div style="position: relative; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center;">
        <canvas id="dcbd-boot-particle-canvas" class="dcbd-orbital-canvas" width="220" height="220" style="width: 220px; height: 220px; display: block; pointer-events: none;"></canvas>
        <div style="position: absolute; top: 50%; left: 50%; width: 76px; height: 76px; border-radius: 22px; background: #ffffff; padding: 6px; border: 2px solid rgba(16, 185, 129, 0.75); display: flex; align-items: center; justify-content: center; overflow: hidden; animation: dcbdCenterLogoFloat 2.4s ease-in-out infinite; z-index: 5;">
          <img src="${window.getDcbdLogoUrl ? window.getDcbdLogoUrl() : '/public/icon/logo.png'}" alt="Dream Cart BD Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 16px;" onerror="window.handleDcbdLogoError ? window.handleDcbdLogoError(this) : (this.src='/icon/logo.png');" />
        </div>
      </div>
      <h2 style="font-size: 20px; font-weight: 900; color: #ffffff; margin: -6px 0 6px 0; letter-spacing: -0.02em;">
        Dream Cart <span style="color: #10b981;">BD</span>
      </h2>
      <p style="font-size: 12.5px; font-weight: 600; color: #94a3b8; margin: 0 0 10px 0;">
        প্ল্যাটফর্ম ও লাইভ ক্যাটালগ প্রস্তুত করা হচ্ছে...
      </p>
      <div style="width: 170px; height: 5px; background: rgba(148, 163, 184, 0.18); border-radius: 9999px; overflow: hidden;">
        <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #10b981, #06b6d4, #fbbf24, #10b981); background-size: 200% 100%; animation: dcbdBarShimmer 1.5s linear infinite; border-radius: 9999px;"></div>
      </div>
    </div>`;
    var c = document.getElementById('dcbd-boot-particle-canvas');
    if (c) startOrbitalParticleCanvas(c);
  };
})();
