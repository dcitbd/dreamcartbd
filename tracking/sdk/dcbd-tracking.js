/**
 * Dream Cart BD — First-Party Namespaced Tracking SDK (tracking/sdk/dcbd-tracking.js)
 * Exposes: window.DCBDTracking
 * - Strict zero-impact isolation (no existing CSS/DOM/JS overrides)
 * - Consent-gated loaders for GTM, GA4, Google Ads + Enhanced Conversions, Meta Pixel, TikTok Pixel, Microsoft Clarity
 * - Shared event_id deduplication with server-side CAPI / GA4 MP / TikTok Events API
 * - Passive storefront observers for all e-commerce funnel events without modifying existing storefront code
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.DCBDTracking) return;

  var BASE = (typeof window.__DCBD_TRACKING_BASE__ === 'string' && window.__DCBD_TRACKING_BASE__)
    ? window.__DCBD_TRACKING_BASE__.replace(/\/$/, '')
    : ((window.__APP_BASE__ || '').replace(/\/$/, ''));
  var API_BASE = (typeof window.__DCBD_TRACKING_API_BASE__ === 'string' && window.__DCBD_TRACKING_API_BASE__)
    ? window.__DCBD_TRACKING_API_BASE__.replace(/\/$/, '')
    : (BASE + '/tracking/api');

  var CONSENT_COOKIE = 'dcbd_trk_consent';
  var CONSENT_STORAGE = 'dcbd_trk_consent_v1';
  var ATTR_STORAGE = 'dcbd_trk_attr_v1';
  var SESSION_STORAGE = 'dcbd_trk_sid_v1';

  var state = {
    initialized: false,
    config: null,
    consent: null,
    loadedProviders: {},
    lastPageViewUrl: '',
    firedPurchases: {},
    staticOnly: false
  };

  function safeJsonParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }

  function getCookie(name) {
    try {
      var parts = (document.cookie || '').split('; ');
      for (var i = 0; i < parts.length; i++) {
        var idx = parts[i].indexOf('=');
        if (idx > 0 && parts[i].slice(0, idx) === name) {
          return decodeURIComponent(parts[i].slice(idx + 1));
        }
      }
    } catch (e) {}
    return '';
  }

  function setCookie(name, val, days) {
    try {
      var exp = new Date(Date.now() + (days || 90) * 86400000).toUTCString();
      var sec = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = name + '=' + encodeURIComponent(val) + '; expires=' + exp + '; path=/; SameSite=Lax' + sec;
    } catch (e) {}
  }

  function getSessionId() {
    try {
      var sid = sessionStorage.getItem(SESSION_STORAGE);
      if (!sid) {
        sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem(SESSION_STORAGE, sid);
      }
      return sid;
    } catch (e) {
      return 'sid_' + Date.now().toString(36);
    }
  }

  function genEventId(eventName, orderId) {
    if (eventName === 'purchase' && orderId) {
      return 'PUR_' + String(orderId).replace(/[^A-Za-z0-9_\-]/g, '');
    }
    return 'DCBD_' + String(eventName || 'EVT').slice(0, 8).toUpperCase() + '_' + Math.floor(Date.now() / 1000) + '_' + Math.random().toString(36).slice(2, 10);
  }

  function captureAttribution() {
    var attr = safeJsonParse(localStorage.getItem(ATTR_STORAGE), {}) || {};
    try {
      var qs = new URLSearchParams(window.location.search || '');
      var keys = ['fbclid', 'gclid', 'wbraid', 'gbraid', 'ttclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      keys.forEach(function (k) {
        var v = qs.get(k);
        if (v) attr[k] = v.slice(0, 200);
      });
      if (attr.fbclid && !attr.fbc) {
        attr.fbc = 'fb.1.' + Date.now() + '.' + attr.fbclid;
      }
      var fbp = getCookie('_fbp');
      if (fbp) attr.fbp = fbp;
      var ttp = getCookie('_ttp');
      if (ttp) attr.ttp = ttp;
      var ga = getCookie('_ga');
      var gaMatch = ga && ga.match(/^GA\d+\.\d+\.(\d+\.\d+)$/);
      if (gaMatch) attr.ga_client_id = gaMatch[1];
      localStorage.setItem(ATTR_STORAGE, JSON.stringify(attr));
    } catch (e) {}
    return attr;
  }

  function getConsentState() {
    if (state.consent) return state.consent;
    var gpc = Boolean(navigator.globalPrivacyControl || navigator.doNotTrack === '1');
    var stored = safeJsonParse(localStorage.getItem(CONSENT_STORAGE), null);
    if (stored && typeof stored === 'object') {
      state.consent = {
        necessary: true,
        analytics: Boolean(stored.analytics),
        marketing: Boolean(stored.marketing) && !(gpc && state.config && state.config.consent && state.config.consent.respectGpcDnt),
        gpc: gpc,
        timestamp: stored.timestamp || new Date().toISOString()
      };
      return state.consent;
    }
    var cfgConsent = (state.config && state.config.consent) || {};
    var defAn = (cfgConsent.defaultAnalytics || 'granted') === 'granted';
    var defMk = (cfgConsent.defaultMarketing || 'granted') === 'granted';
    if (gpc && cfgConsent.respectGpcDnt !== false) defMk = false;
    state.consent = {
      necessary: true,
      analytics: defAn,
      marketing: defMk,
      gpc: gpc,
      timestamp: new Date().toISOString()
    };
    return state.consent;
  }

  function saveConsent(analytics, marketing, source) {
    var gpc = Boolean(navigator.globalPrivacyControl);
    var next = {
      necessary: true,
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      gpc: gpc,
      timestamp: new Date().toISOString()
    };
    state.consent = next;
    try {
      localStorage.setItem(CONSENT_STORAGE, JSON.stringify(next));
      setCookie(CONSENT_COOKIE, JSON.stringify({ analytics: next.analytics, marketing: next.marketing }), 180);
    } catch (e) {}

    // Update Google Consent Mode v2 if gtag exists
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: next.analytics ? 'granted' : 'denied',
        ad_storage: next.marketing ? 'granted' : 'denied',
        ad_user_data: next.marketing ? 'granted' : 'denied',
        ad_personalization: next.marketing ? 'granted' : 'denied'
      });
    }
    // Update Microsoft Clarity Consent API if loaded
    if (typeof window.clarity === 'function') {
      try { window.clarity('consent', next.analytics); } catch (e) {}
    }

    sendToCollector({
      type: 'consent',
      session_id: getSessionId(),
      analytics: next.analytics,
      marketing: next.marketing,
      gpc: gpc,
      source: source || 'preferences'
    });

    loadEnabledBrowserTags();
    return next;
  }

  function sendToCollector(payload) {
    if (state.staticOnly) return;
    if (window.__DCBD_PHP_UNAVAILABLE__ && !window.__DCBD_TRACKING_API_BASE__) {
      state.staticOnly = true;
      return;
    }
    try {
      var url = API_BASE + '/collect.php';
      var json = JSON.stringify(payload);
      if (navigator.sendBeacon && json.length < 30000) {
        var blob = new Blob([json], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return;
      }
      if (typeof fetch === 'function') {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: json,
          keepalive: true,
          credentials: 'same-origin'
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function injectScriptOnce(key, src) {
    if (state.loadedProviders[key]) return;
    if (document.querySelector('script[src="' + src + '"]')) {
      state.loadedProviders[key] = true;
      return;
    }
    state.loadedProviders[key] = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    s.onerror = function () {};
    document.head.appendChild(s);
  }

  function loadEnabledBrowserTags() {
    if (!state.config || !state.config.masterEnabled) return;
    var p = state.config.platforms || {};
    var c = getConsentState();

    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }

    // Consent Mode defaults before tags load
    if (!state.loadedProviders._consentDefault) {
      state.loadedProviders._consentDefault = true;
      window.gtag('consent', 'default', {
        analytics_storage: c.analytics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied'
      });
    }

    // 1. Google Tag Manager
    if (p.gtm && p.gtm.enabled && p.gtm.containerId && (c.analytics || c.marketing)) {
      if (!state.loadedProviders.gtm) {
        window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
        injectScriptOnce('gtm', 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(p.gtm.containerId));
      }
    }

    // 2. GA4 / Google Ads gtag.js
    var primaryGtag = (p.ga4 && p.ga4.enabled && c.analytics && p.ga4.measurementId)
      || (p.googleAds && p.googleAds.enabled && c.marketing && p.googleAds.conversionId)
      || '';
    if (primaryGtag) {
      if (!state.loadedProviders.gtagBase) {
        injectScriptOnce('gtagBase', 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryGtag));
        window.gtag('js', new Date());
      }
      if (p.ga4 && p.ga4.enabled && c.analytics && p.ga4.measurementId && !state.loadedProviders.ga4Cfg) {
        state.loadedProviders.ga4Cfg = true;
        window.gtag('config', p.ga4.measurementId, { send_page_view: false, currency: 'BDT' });
      }
      if (p.googleAds && p.googleAds.enabled && c.marketing && p.googleAds.conversionId && !state.loadedProviders.gadsCfg) {
        state.loadedProviders.gadsCfg = true;
        window.gtag('config', p.googleAds.conversionId, { allow_enhanced_conversions: Boolean(p.googleAds.enhancedConversions) });
      }
    }

    // 3. Meta Pixel (strictly marketing consent gated + cross-module duplicate-init guard)
    if (p.meta && p.meta.enabled && p.meta.pixelId && c.marketing && !state.loadedProviders.meta) {
      window.__dcbdConfiguredPixelIds = window.__dcbdConfiguredPixelIds || new Set();
      if (!window.fbq) {
        var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!window._fbq) window._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      }
      injectScriptOnce('meta', 'https://connect.facebook.net/en_US/fbevents.js');
      if (!window.__dcbdConfiguredPixelIds.has('fb:' + p.meta.pixelId)) {
        window.__dcbdConfiguredPixelIds.add('fb:' + p.meta.pixelId);
        window.fbq('init', p.meta.pixelId, { country: 'bd' });
      }
    }

    // 4. TikTok Pixel (strictly marketing consent gated)
    if (p.tiktok && p.tiktok.enabled && p.tiktok.pixelId && c.marketing && !state.loadedProviders.tiktok) {
      if (!window.ttq) {
        var ttq = window.ttq = [];
        ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
        ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.load = function (id) {
          injectScriptOnce('tiktok', 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + encodeURIComponent(id) + '&lib=ttq');
        };
      }
      if (typeof window.ttq.load === 'function') window.ttq.load(p.tiktok.pixelId);
      state.loadedProviders.tiktok = true;
    }

    // 5. Microsoft Clarity (strictly analytics consent gated)
    if (p.clarity && p.clarity.enabled && p.clarity.projectId && c.analytics && !state.loadedProviders.clarity) {
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      injectScriptOnce('clarity', 'https://www.clarity.ms/tag/' + encodeURIComponent(p.clarity.projectId));
    }
  }

  function normalizeItem(prod, qty) {
    if (!prod || typeof prod !== 'object') return null;
    var id = String(prod.item_id || prod.sku || prod.product_id || prod.id || '').trim();
    var name = String(prod.item_name || prod.name || prod.p_name || '').trim();
    if (!id && !name) return null;
    return {
      item_id: id || name.slice(0, 32),
      item_name: name || id,
      price: Math.max(0, Number(prod.price || prod.selling_price || 0) || 0),
      quantity: Math.max(1, parseInt(qty || prod.quantity || 1, 10) || 1),
      item_category: String(prod.item_category || prod.category || '').trim(),
      item_brand: String(prod.item_brand || prod.brand || '').trim()
    };
  }

  function dispatchBrowserTags(ev) {
    if (!state.config || !state.config.masterEnabled) return;
    var p = state.config.platforms || {};
    var c = getConsentState();
    var items = ev.items || [];
    var contentIds = items.map(function (i) { return i.item_id; });

    // DataLayer (GTM single source of truth)
    window.dataLayer = window.dataLayer || [];
    if (items.length > 0) window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: ev.event_name,
      event_id: ev.event_id,
      ecommerce: {
        currency: ev.currency,
        value: ev.value,
        transaction_id: ev.order_id || undefined,
        items: items
      }
    });

    // GA4 browser tag
    if (p.ga4 && p.ga4.enabled && c.analytics && typeof window.gtag === 'function') {
      var gaParams = {
        event_id: ev.event_id,
        currency: ev.currency,
        value: ev.value
      };
      if (items.length > 0) gaParams.items = items;
      if (ev.order_id) gaParams.transaction_id = ev.order_id;
      if (ev.search_term) gaParams.search_term = ev.search_term;
      if (ev.event_name === 'page_view') {
        gaParams.page_location = ev.event_source_url;
        gaParams.page_title = document.title;
      }
      window.gtag('event', ev.event_name, gaParams);
    }

    // Google Ads conversion tag (purchase only, with consent)
    if (ev.event_name === 'purchase' && p.googleAds && p.googleAds.enabled && p.googleAds.conversionId && p.googleAds.conversionLabel && c.marketing && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: p.googleAds.conversionId + '/' + p.googleAds.conversionLabel,
        value: ev.value,
        currency: ev.currency,
        transaction_id: ev.order_id
      });
    }

    // Meta Pixel (deduplicated via eventID)
    if (p.meta && p.meta.enabled && c.marketing && typeof window.fbq === 'function') {
      var metaMap = {
        page_view: 'PageView',
        view_item: 'ViewContent',
        search: 'Search',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        add_payment_info: 'AddPaymentInfo',
        sign_up: 'CompleteRegistration',
        generate_lead: 'Lead',
        contact: 'Contact',
        purchase: 'Purchase'
      };
      var metaName = metaMap[ev.event_name];
      if (metaName) {
        var mData = { currency: ev.currency, value: ev.value };
        if (contentIds.length > 0) {
          mData.content_ids = contentIds;
          mData.content_type = 'product';
          mData.contents = items.map(function (i) { return { id: i.item_id, quantity: i.quantity, item_price: i.price }; });
        }
        if (ev.order_id) mData.order_id = ev.order_id;
        if (ev.search_term) mData.search_string = ev.search_term;
        if (metaName === 'PageView') {
          if (window.__dcbdInitialPageViewFired && !window.__dcbdTrkFirstPvConsumed) {
            window.__dcbdTrkFirstPvConsumed = true;
          } else {
            window.fbq('track', 'PageView', {}, { eventID: ev.event_id });
            window.__dcbdInitialPageViewFired = true;
          }
        } else {
          window.fbq('track', metaName, mData, { eventID: ev.event_id });
        }
      }
    }

    // TikTok Pixel (deduplicated via event_id)
    if (p.tiktok && p.tiktok.enabled && c.marketing && window.ttq && typeof window.ttq.track === 'function') {
      var ttMap = {
        view_item: 'ViewContent',
        search: 'Search',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        add_payment_info: 'AddPaymentInfo',
        sign_up: 'CompleteRegistration',
        generate_lead: 'SubmitForm',
        contact: 'Contact',
        purchase: 'CompletePayment'
      };
      if (ev.event_name === 'page_view' && typeof window.ttq.page === 'function') {
        window.ttq.page();
      } else if (ttMap[ev.event_name]) {
        window.ttq.track(ttMap[ev.event_name], {
          currency: ev.currency,
          value: ev.value,
          contents: items.map(function (i) { return { content_id: i.item_id, content_name: i.item_name, price: i.price, quantity: i.quantity }; }),
          query: ev.search_term || undefined
        }, { event_id: ev.event_id });
      }
    }
  }

  function track(eventName, payload) {
    try {
      var data = (payload && typeof payload === 'object') ? payload : {};
      var orderId = data.order_id ? String(data.order_id) : '';
      if (eventName === 'purchase' && orderId) {
        if (state.firedPurchases[orderId]) return null;
        state.firedPurchases[orderId] = true;
      }

      var items = Array.isArray(data.items) ? data.items.map(function (it) { return normalizeItem(it); }).filter(Boolean) : [];
      var val = Number(data.value || 0) || 0;
      if (val === 0 && items.length > 0) {
        val = items.reduce(function (sum, i) { return sum + (i.price * i.quantity); }, 0);
      }

      var canonical = {
        event_name: String(eventName || '').toLowerCase(),
        event_id: data.event_id || genEventId(eventName, orderId),
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        currency: data.currency || 'BDT',
        value: Math.round(val * 100) / 100,
        order_id: orderId,
        items: items,
        search_term: data.search_term || undefined,
        shipping_tier: data.shipping_tier || undefined,
        payment_type: data.payment_type || undefined,
        method: data.method || undefined,
        item_list_name: data.item_list_name || undefined,
        page_title: document.title || '',
        consent_state: getConsentState(),
        attribution: captureAttribution(),
        is_test: Boolean(state.config && state.config.testMode)
      };

      dispatchBrowserTags(canonical);

      // Server-side authoritative rule: never send browser-forged purchase to /collect.php (server enqueues it in api/index.php)
      if (canonical.event_name !== 'purchase' && canonical.event_name !== 'refund') {
        sendToCollector(canonical);
      }
      return canonical.event_id;
    } catch (e) {
      return null;
    }
  }

  // Optional Consent Banner — ONLY rendered when explicitly enabled in /admin/tracking/ (Design Protection Rule 5)
  function maybeRenderConsentBanner() {
    if (!state.config || !state.config.consent || !state.config.consent.bannerEnabled) return;
    if (localStorage.getItem(CONSENT_STORAGE)) return;
    if (document.getElementById('dcbd-trk-consent-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'dcbd-trk-consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie & Privacy Preferences');
    bar.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;max-width:680px;margin:0 auto;z-index:99990;background:#0f172a;color:#f8fafc;border:1px solid rgba(16,185,129,0.45);border-radius:16px;padding:14px 18px;box-shadow:0 16px 40px rgba(0,0,0,0.35);font-family:inherit;font-size:13px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;';

    var msg = document.createElement('div');
    msg.style.cssText = 'flex:1 1 280px;line-height:1.45;';
    msg.textContent = state.config.consent.bannerTextBn || 'আমরা সাইটের অভিজ্ঞতা উন্নত করতে কুকি ও অ্যানালিটিক্স ব্যবহার করি।';

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';

    var btnReject = document.createElement('button');
    btnReject.type = 'button';
    btnReject.textContent = 'শুধু প্রয়োজনীয়';
    btnReject.style.cssText = 'padding:7px 12px;border-radius:10px;border:1px solid #475569;background:transparent;color:#cbd5e1;font-weight:600;cursor:pointer;font-size:12px;';
    btnReject.onclick = function () { saveConsent(false, false, 'banner'); bar.remove(); };

    var btnAccept = document.createElement('button');
    btnAccept.type = 'button';
    btnAccept.textContent = 'সব গ্রহণ করুন';
    btnAccept.style.cssText = 'padding:7px 14px;border-radius:10px;border:none;background:#059669;color:#ffffff;font-weight:700;cursor:pointer;font-size:12px;';
    btnAccept.onclick = function () { saveConsent(true, true, 'banner'); bar.remove(); };

    actions.appendChild(btnReject);
    actions.appendChild(btnAccept);
    bar.appendChild(msg);
    bar.appendChild(actions);
    document.body.appendChild(bar);
  }

  // Passive, non-intrusive storefront observers (0 modifications to existing JS/DOM)
  function attachPassiveObservers() {
    var handleRoute = function () {
      var href = window.location.href;
      if (state.lastPageViewUrl === href) return;
      state.lastPageViewUrl = href;
      api.pageView();

      var p = (window.location.pathname || '').toLowerCase();
      if (p === '/cart') {
        var items = (window.cartStore && window.cartStore.items) || [];
        api.viewCart({ items: items, value: window.cartStore ? window.cartStore.getGrandTotal() : 0 });
      } else if (p === '/checkout' || p === '/order') {
        var cItems = (window.cartStore && window.cartStore.items) || [];
        api.beginCheckout({ items: cItems, value: window.cartStore ? window.cartStore.getGrandTotal() : 0 });
      }
    };

    // Observe SPA History changes without replacing existing router
    var origPush = history.pushState;
    if (typeof origPush === 'function' && !origPush.__dcbdTrkWrapped) {
      var wrapped = function () {
        var ret = origPush.apply(this, arguments);
        setTimeout(handleRoute, 50);
        return ret;
      };
      wrapped.__dcbdTrkWrapped = true;
      history.pushState = wrapped;
    }
    window.addEventListener('popstate', function () { setTimeout(handleRoute, 50); });
    setTimeout(handleRoute, 120);

    // Passive delegated listeners for shipping/payment selection, cart removals, contact links
    document.addEventListener('change', function (e) {
      var t = e && e.target;
      if (!t) return;
      if (t.name === 'delivery_zone' && t.value) {
        api.addShippingInfo({ shipping_tier: t.value, value: window.cartStore ? window.cartStore.getGrandTotal() : 0 });
      } else if (t.name === 'payment_method' && t.value) {
        api.addPaymentInfo({ payment_type: t.value, value: window.cartStore ? window.cartStore.getGrandTotal() : 0 });
      }
    }, true);

    document.addEventListener('click', function (e) {
      var target = e && e.target;
      if (!target || !target.closest) return;
      var rem = target.closest('.btn-cart-remove');
      if (rem) {
        var pid = rem.getAttribute('data-product-id') || '';
        if (pid) api.removeFromCart({ item_id: pid, item_name: pid }, 1);
      }
    }, true);
  }

  var api = {
    version: '1.0.0',
    track: track,
    pageView: function () { return track('page_view', { page_title: document.title }); },
    viewItem: function (product) {
      var it = normalizeItem(product, 1);
      return it ? track('view_item', { value: it.price, items: [it] }) : null;
    },
    viewItemList: function (items, listName) {
      var list = (Array.isArray(items) ? items : []).slice(0, 30).map(function (p) { return normalizeItem(p, 1); }).filter(Boolean);
      return list.length ? track('view_item_list', { items: list, item_list_name: listName || 'Catalog' }) : null;
    },
    selectItem: function (product, listName) {
      var it = normalizeItem(product, 1);
      return it ? track('select_item', { value: it.price, items: [it], item_list_name: listName || 'Catalog' }) : null;
    },
    search: function (term) {
      var q = String(term || '').trim();
      if (!q || /@|\b\d{11,16}\b/.test(q)) return null;
      return track('search', { search_term: q });
    },
    addToCart: function (product, quantity) {
      var it = normalizeItem(product, quantity || 1);
      return it ? track('add_to_cart', { value: it.price * it.quantity, items: [it] }) : null;
    },
    removeFromCart: function (product, quantity) {
      var it = normalizeItem(product, quantity || 1);
      return it ? track('remove_from_cart', { value: it.price * it.quantity, items: [it] }) : null;
    },
    viewCart: function (cart) {
      var items = (cart && Array.isArray(cart.items)) ? cart.items : [];
      return track('view_cart', { value: (cart && cart.value) || 0, items: items });
    },
    beginCheckout: function (cart) {
      var items = (cart && Array.isArray(cart.items)) ? cart.items : [];
      return track('begin_checkout', { value: (cart && cart.value) || 0, items: items });
    },
    addShippingInfo: function (data) { return track('add_shipping_info', data || {}); },
    addPaymentInfo: function (data) { return track('add_payment_info', data || {}); },
    signUp: function (data) { return track('sign_up', data || {}); },
    login: function (data) { return track('login', data || {}); },
    generateLead: function (data) { return track('generate_lead', data || {}); },
    contact: function (data) { return track('contact', data || {}); },
    purchase: function (order) { return track('purchase', order || {}); },
    getConsent: getConsentState,
    setConsent: saveConsent
  };

  window.DCBDTracking = api;

  // Bootstrap public non-secret config asynchronously (never blocks page paint)
  (function init() {
    if (state.initialized) return;
    state.initialized = true;
    captureAttribution();
    if (typeof fetch !== 'function') {
      attachPassiveObservers();
      return;
    }
    fetch(API_BASE + '/config.php', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (res) {
        if (res && res.ok && res.config) {
          state.config = res.config;
          loadEnabledBrowserTags();
          maybeRenderConsentBanner();
        } else {
          state.staticOnly = true;
        }
      })
      .catch(function () { state.staticOnly = true; })
      .finally(function () { attachPassiveObservers(); });
  })();
})();
