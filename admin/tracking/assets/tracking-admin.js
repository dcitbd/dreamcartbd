/**
 * Dream Cart BD — Tracking Admin Dashboard Application (admin/tracking/assets/tracking-admin.js)
 * Connects strictly to /tracking/api/admin.php with Session + CSRF tokens.
 * Displays real SQLite database values only (zero hardcoded demo stats).
 */
(function () {
  'use strict';

  var API = '../../tracking/api/admin.php';
  var state = {
    csrf: '',
    user: null,
    tab: 'overview',
    settings: {},
    secrets: {},
    eventPage: 1,
    logPage: 1
  };

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showToast(msg, isErr) {
    var el = document.getElementById('trk-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'dcbd-trk-toast ' + (isErr ? 'dcbd-trk-alert' : '');
    setTimeout(function () { el.classList.add('dcbd-trk-hidden'); }, 4000);
  }

  async function apiGet(action, params) {
    var qs = new URLSearchParams(Object.assign({ action: action }, params || {}));
    var r = await fetch(API + '?' + qs.toString(), { credentials: 'same-origin' });
    return r.json();
  }

  async function apiPost(action, body) {
    var r = await fetch(API + '?action=' + encodeURIComponent(action), {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': state.csrf || ''
      },
      body: JSON.stringify(body || {})
    });
    return r.json();
  }

  function setAuthUI(isAuth) {
    document.getElementById('dcbd-trk-login-view').classList.toggle('dcbd-trk-hidden', isAuth);
    document.getElementById('dcbd-trk-app').classList.toggle('dcbd-trk-hidden', !isAuth);
    if (isAuth && state.user) {
      document.getElementById('trk-user-pill').textContent = state.user.username + ' (' + state.user.role + ')';
    }
  }

  async function checkSession() {
    var res = await apiGet('auth/me');
    state.csrf = res.csrf || '';
    if (res.authenticated) {
      state.user = res.user;
      setAuthUI(true);
      await loadTab(state.tab);
    } else {
      setAuthUI(false);
    }
  }

  async function loadTab(tab) {
    state.tab = tab;
    var titles = {
      overview: '1. Overview',
      connections: '2. Platform Connections',
      pixels: '3. Pixel / Measurement IDs',
      credentials: '4. Server API Credentials (Encrypted & Masked)',
      events: '5. Event Stream',
      logs: '6. Delivery Logs',
      queue: '7. Failed Events / Retry Queue',
      purchases: '8. Purchase Reports',
      consent: '9. Consent & Privacy Settings',
      users: '10. User Roles & Permissions',
      audit: '11. Audit Logs',
      health: '12. System Health & Diagnostics'
    };
    document.getElementById('trk-page-title').textContent = titles[tab] || 'Overview';
    document.querySelectorAll('#dcbd-trk-nav button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });

    var box = document.getElementById('trk-view-container');
    box.innerHTML = '<div class="dcbd-trk-card">Loading real data...</div>';

    if (tab === 'overview') return renderOverview(box);
    if (tab === 'connections') return renderConnections(box);
    if (tab === 'pixels') return renderPixels(box);
    if (tab === 'credentials') return renderCredentials(box);
    if (tab === 'events') return renderEvents(box);
    if (tab === 'logs') return renderLogs(box);
    if (tab === 'queue') return renderQueue(box);
    if (tab === 'purchases') return renderPurchases(box);
    if (tab === 'consent') return renderConsent(box);
    if (tab === 'users') return renderUsers(box);
    if (tab === 'audit') return renderAudit(box);
    if (tab === 'health') return renderHealth(box);
  }

  async function renderOverview(box) {
    var res = await apiGet('overview');
    if (!res.ok) { box.innerHTML = '<div class="dcbd-trk-alert">' + esc(res.error) + '</div>'; return; }
    var d = res.data;
    var badge = document.getElementById('trk-master-badge');
    badge.textContent = d.master_enabled ? (d.test_mode ? 'ACTIVE (TEST MODE)' : 'ACTIVE') : 'DISABLED';
    badge.className = 'dcbd-trk-status-pill ' + (d.master_enabled ? (d.test_mode ? 'dcbd-trk-warn' : 'dcbd-trk-ok') : 'dcbd-trk-err');

    box.innerHTML = ''
      + '<div class="dcbd-trk-grid">'
      + '  <div class="dcbd-trk-card"><div class="dcbd-trk-kpi-label">Total Events Recorded</div><div class="dcbd-trk-kpi-val">' + d.total_events + '</div><div class="dcbd-trk-kpi-sub">Last 24h: ' + d.events_24h + '</div></div>'
      + '  <div class="dcbd-trk-card"><div class="dcbd-trk-kpi-label">Queue Depth (Pending / Failed)</div><div class="dcbd-trk-kpi-val">' + d.queue.pending + ' / ' + d.queue.failed + '</div><div class="dcbd-trk-kpi-sub">Delivered: ' + d.queue.delivered + ' | Dead-letter: ' + d.queue.dead_letter + '</div></div>'
      + '  <div class="dcbd-trk-card"><div class="dcbd-trk-kpi-label">Authoritative Purchases</div><div class="dcbd-trk-kpi-val">' + d.purchases.count + '</div><div class="dcbd-trk-kpi-sub">Total: BDT ' + d.purchases.total_value + '</div></div>'
      + '  <div class="dcbd-trk-card"><div class="dcbd-trk-kpi-label">Last Delivery Status</div><div class="dcbd-trk-kpi-val" style="font-size:14px">' + (d.last_success ? esc(d.last_success.provider) : 'None yet') + '</div><div class="dcbd-trk-kpi-sub">' + (d.last_error ? ('Last err: ' + esc(d.last_error.provider) + ' — ' + esc(d.last_error.error_message).slice(0, 60)) : 'No delivery errors recorded') + '</div></div>'
      + '</div>'
      + '<div class="dcbd-trk-card"><h3>Server Adapters Status</h3><div class="dcbd-trk-table-wrap"><table class="dcbd-trk-table"><thead><tr><th>Platform</th><th>Category</th><th>Configured</th><th>Enabled</th></tr></thead><tbody>'
      + d.adapters.map(function (a) {
          return '<tr><td>' + esc(a.display_name) + '</td><td>' + esc(a.category) + '</td><td><span class="dcbd-trk-status-pill ' + (a.configured ? 'dcbd-trk-ok' : 'dcbd-trk-warn') + '">' + (a.configured ? 'Yes' : 'Missing Credentials') + '</span></td><td><span class="dcbd-trk-status-pill ' + (a.enabled ? 'dcbd-trk-ok' : '') + '">' + (a.enabled ? 'Enabled' : 'Disabled') + '</span></td></tr>';
        }).join('')
      + '</tbody></table></div></div>'
      + '<div class="dcbd-trk-card"><h3>Event Counts Breakdown</h3>'
      + (d.event_breakdown.length ? '<table class="dcbd-trk-table"><thead><tr><th>Event Name</th><th>Count</th></tr></thead><tbody>' + d.event_breakdown.map(function (r) { return '<tr><td class="dcbd-trk-mono">' + esc(r.event_name) + '</td><td>' + r.cnt + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="dcbd-trk-kpi-sub">No events recorded yet.</p>')
      + '</div>';
  }

  async function renderConnections(box) {
    var res = await apiGet('settings/get');
    state.settings = res.settings || {};
    var s = state.settings;
    var switches = [
      ['master_enabled', 'Master Tracking Kill-Switch (Turn OFF to instantly pause all tracking)'],
      ['test_mode', 'Global Test / Debug Mode (Meta test_event_code, GA4 /debug/mp/collect, TikTok test_event_code)'],
      ['meta_pixel_enabled', 'Meta Pixel (Browser — Facebook & Instagram)'],
      ['meta_capi_enabled', 'Meta Conversions API (Server — Graph API v27.0)'],
      ['gtm_enabled', 'Google Tag Manager (Browser Container)'],
      ['ga4_enabled', 'Google Analytics 4 (Browser gtag.js)'],
      ['ga4_mp_enabled', 'GA4 Measurement Protocol (Server-Side)'],
      ['google_ads_enabled', 'Google Ads Conversion Tracking'],
      ['google_ads_ec_enabled', 'Google Ads Enhanced Conversions (Consent-Gated Hashed PII)'],
      ['tiktok_pixel_enabled', 'TikTok Pixel (Browser)'],
      ['tiktok_events_api_enabled', 'TikTok Events API v1.3 (Server-Side)'],
      ['clarity_enabled', 'Microsoft Clarity (Browser Session Replay & Heatmaps)']
    ];

    box.innerHTML = '<div class="dcbd-trk-card"><h3>Platform Switches</h3><form id="trk-conn-form" class="dcbd-trk-form">'
      + switches.map(function (item) {
          return '<div class="dcbd-trk-switch-row"><span>' + esc(item[1]) + '</span><input type="checkbox" name="' + esc(item[0]) + '" ' + (s[item[0]] ? 'checked' : '') + ' /></div>';
        }).join('')
      + '<div><button type="submit" class="dcbd-trk-btn dcbd-trk-btn-primary">Save Connections</button></div></form></div>'
      + '<div class="dcbd-trk-card"><h3>Test Server Provider Connections</h3><div style="display:flex;gap:8px;flex-wrap:wrap">'
      + ['meta_capi', 'ga4_mp', 'tiktok_events_api', 'google_ads'].map(function (p) {
          return '<button type="button" class="dcbd-trk-btn dcbd-trk-btn-secondary trk-test-prov" data-provider="' + p + '">Test ' + p + '</button>';
        }).join('')
      + '</div><pre id="trk-test-out" class="dcbd-trk-pre dcbd-trk-hidden" style="margin-top:12px"></pre></div>';

    document.getElementById('trk-conn-form').onsubmit = async function (e) {
      e.preventDefault();
      var upd = {};
      switches.forEach(function (item) {
        upd[item[0]] = Boolean(e.target.elements[item[0]].checked);
      });
      var r = await apiPost('settings/save', { settings: upd });
      showToast(r.ok ? 'Platform connections updated.' : (r.error || 'Failed'), !r.ok);
    };

    box.querySelectorAll('.trk-test-prov').forEach(function (btn) {
      btn.onclick = async function () {
        var prov = btn.getAttribute('data-provider');
        var out = document.getElementById('trk-test-out');
        out.classList.remove('dcbd-trk-hidden');
        out.textContent = 'Testing ' + prov + '...';
        var r = await apiPost('providers/test', { provider: prov });
        out.textContent = JSON.stringify(r, null, 2);
      };
    });
  }

  async function renderPixels(box) {
    var res = await apiGet('settings/get');
    var s = res.settings || {};
    var fields = [
      ['gtm_container_id', 'GTM Container ID (GTM-XXXXXXX)', 'Google Tag Manager > Admin > Container ID'],
      ['ga4_measurement_id', 'GA4 Measurement ID (G-XXXXXXXXXX)', 'GA4 Admin > Data Streams > Web Stream'],
      ['google_ads_conversion_id', 'Google Ads Conversion ID (AW-XXXXXXXXXX)', 'Google Ads > Goals > Conversions > Tag Setup'],
      ['google_ads_conversion_label', 'Google Ads Conversion Label', 'Google Ads > Purchase Conversion Action > Label'],
      ['meta_pixel_id', 'Meta Pixel / Dataset ID', 'Meta Events Manager > Data Sources > Settings'],
      ['meta_test_event_code', 'Meta Test Event Code (Test Only)', 'Meta Events Manager > Test Events Tab'],
      ['tiktok_pixel_id', 'TikTok Pixel ID', 'TikTok Events Manager > Web Events > Pixel ID'],
      ['tiktok_test_event_code', 'TikTok Test Event Code (Test Only)', 'TikTok Events Manager > Test Events Tab'],
      ['clarity_project_id', 'Microsoft Clarity Project ID', 'Clarity Dashboard > Settings > Overview']
    ];

    box.innerHTML = '<div class="dcbd-trk-card"><h3>Public Pixel &amp; Measurement IDs</h3><form id="trk-pixels-form" class="dcbd-trk-form"><div class="dcbd-trk-form-grid">'
      + fields.map(function (f) {
          return '<label>' + esc(f[1]) + '<input type="text" name="' + esc(f[0]) + '" value="' + esc(s[f[0]] || '') + '" placeholder="' + esc(f[2]) + '" /><span class="dcbd-trk-kpi-sub">Source: ' + esc(f[2]) + '</span></label>';
        }).join('')
      + '</div><div><button type="submit" class="dcbd-trk-btn dcbd-trk-btn-primary">Save Public IDs</button></div></form></div>';

    document.getElementById('trk-pixels-form').onsubmit = async function (e) {
      e.preventDefault();
      var upd = {};
      fields.forEach(function (f) { upd[f[0]] = e.target.elements[f[0]].value.trim(); });
      var r = await apiPost('settings/save', { settings: upd });
      showToast(r.ok ? 'Pixel & Measurement IDs saved.' : (r.error || 'Save failed'), !r.ok);
    };
  }

  async function renderCredentials(box) {
    var res = await apiGet('settings/get');
    var sec = res.secrets || {};
    var defs = [
      ['meta_capi_access_token', 'Meta CAPI Access Token (Server Only)', 'Events Manager > Settings > Conversions API > Generate access token'],
      ['ga4_api_secret', 'GA4 Measurement Protocol API Secret (Server Only)', 'GA4 Admin > Data Streams > Measurement Protocol API secrets'],
      ['tiktok_events_api_token', 'TikTok Events API Access Token (Server Only)', 'TikTok Events Manager > Settings > Generate Access Token']
    ];

    box.innerHTML = '<div class="dcbd-trk-card"><h3>Encrypted Server-Only API Credentials</h3><p class="dcbd-trk-kpi-sub">Tokens are encrypted with AES-256-GCM in SQLite and strictly masked. Full tokens are never returned to the browser.</p>'
      + defs.map(function (d) {
          var info = sec[d[0]] || { configured: false, masked: '' };
          return '<form class="dcbd-trk-form trk-secret-form" data-key="' + esc(d[0]) + '" style="margin-top:14px;padding-top:14px;border-top:1px solid #1e293b">'
            + '<div style="display:flex;justify-content:space-between;align-items:center"><strong>' + esc(d[1]) + '</strong><span class="dcbd-trk-status-pill ' + (info.configured ? 'dcbd-trk-ok' : 'dcbd-trk-warn') + '">' + (info.configured ? ('Configured: ' + esc(info.masked)) : 'Not Configured') + '</span></div>'
            + '<span class="dcbd-trk-kpi-sub">Where to get it: ' + esc(d[2]) + '</span>'
            + '<div style="display:flex;gap:8px"><input type="password" name="val" placeholder="Paste new token to update (leave blank to clear)" style="flex:1" /><button type="submit" class="dcbd-trk-btn dcbd-trk-btn-primary">Save Encrypted</button></div>'
            + '</form>';
        }).join('')
      + '</div>';

    box.querySelectorAll('.trk-secret-form').forEach(function (form) {
      form.onsubmit = async function (e) {
        e.preventDefault();
        var key = form.getAttribute('data-key');
        var val = form.elements.val.value.trim();
        var r = await apiPost('secrets/save', { secret_key: key, secret_value: val });
        showToast(r.ok ? 'Credential updated & masked.' : (r.error || 'Error'), !r.ok);
        if (r.ok) renderCredentials(box);
      };
    });
  }

  async function renderEvents(box) {
    var q = (document.getElementById('trk-ev-q') && document.getElementById('trk-ev-q').value) || '';
    var en = (document.getElementById('trk-ev-name') && document.getElementById('trk-ev-name').value) || '';
    var res = await apiGet('events/list', { page: state.eventPage, per_page: 25, q: q, event_name: en });
    var items = res.items || [];
    box.innerHTML = '<div class="dcbd-trk-card"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'
      + '<input type="text" id="trk-ev-q" value="' + esc(q) + '" placeholder="Search event_id, order_id, URL..." style="background:#0b1120;border:1px solid #334155;color:#fff;padding:7px 10px;border-radius:8px;flex:1;min-width:180px" />'
      + '<input type="text" id="trk-ev-name" value="' + esc(en) + '" placeholder="Filter event_name (e.g. purchase)" style="background:#0b1120;border:1px solid #334155;color:#fff;padding:7px 10px;border-radius:8px;width:200px" />'
      + '<button id="trk-ev-filter" class="dcbd-trk-btn dcbd-trk-btn-primary">Filter</button></div>'
      + '<div class="dcbd-trk-table-wrap"><table class="dcbd-trk-table"><thead><tr><th>Event ID</th><th>Event</th><th>Order ID</th><th>Value</th><th>Source</th><th>Time</th><th>Details</th></tr></thead><tbody>'
      + (items.length ? items.map(function (it) {
          return '<tr><td class="dcbd-trk-mono">' + esc(it.event_id) + '</td><td><strong>' + esc(it.event_name) + '</strong>' + (it.is_test ? ' <span class="dcbd-trk-status-pill dcbd-trk-warn">TEST</span>' : '') + '</td><td class="dcbd-trk-mono">' + esc(it.order_id || '—') + '</td><td>' + esc(it.currency) + ' ' + esc(it.value) + '</td><td>' + esc(it.source_origin) + '</td><td>' + esc(it.created_at) + '</td><td><button class="dcbd-trk-btn dcbd-trk-btn-outline dcbd-trk-btn-sm trk-open-ev" data-eid="' + esc(it.event_id) + '">Inspect</button></td></tr>';
        }).join('') : '<tr><td colspan="7">No events recorded yet.</td></tr>')
      + '</tbody></table></div>'
      + '<div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center"><span class="dcbd-trk-kpi-sub">Total: ' + (res.total || 0) + ' (Page ' + state.eventPage + ')</span><div style="display:flex;gap:6px"><button id="trk-ev-prev" class="dcbd-trk-btn dcbd-trk-btn-outline dcbd-trk-btn-sm">Prev</button><button id="trk-ev-next" class="dcbd-trk-btn dcbd-trk-btn-outline dcbd-trk-btn-sm">Next</button></div></div></div>';

    document.getElementById('trk-ev-filter').onclick = function () { state.eventPage = 1; renderEvents(box); };
    document.getElementById('trk-ev-prev').onclick = function () { if (state.eventPage > 1) { state.eventPage--; renderEvents(box); } };
    document.getElementById('trk-ev-next').onclick = function () { if ((state.eventPage * 25) < (res.total || 0)) { state.eventPage++; renderEvents(box); } };
    box.querySelectorAll('.trk-open-ev').forEach(function (b) {
      b.onclick = function () { openEventDetail(b.getAttribute('data-eid')); };
    });
  }

  async function openEventDetail(eid) {
    var modal = document.getElementById('trk-event-modal');
    var body = document.getElementById('trk-event-modal-body');
    modal.classList.remove('dcbd-trk-hidden');
    body.innerHTML = 'Loading...';
    var res = await apiGet('events/detail', { event_id: eid });
    body.innerHTML = '<pre class="dcbd-trk-pre">' + esc(JSON.stringify(res, null, 2)) + '</pre>';
  }

  async function renderLogs(box) {
    var res = await apiGet('logs/list', { page: state.logPage, per_page: 25 });
    var items = res.items || [];
    box.innerHTML = '<div class="dcbd-trk-card"><h3>Provider Delivery Logs (' + (res.total || 0) + ')</h3><div class="dcbd-trk-table-wrap"><table class="dcbd-trk-table"><thead><tr><th>Event ID</th><th>Provider</th><th>Attempt</th><th>Status</th><th>HTTP</th><th>Latency</th><th>Summary / Error</th><th>Time</th></tr></thead><tbody>'
      + (items.length ? items.map(function (l) {
          var cls = l.status === 'delivered' ? 'dcbd-trk-ok' : (l.status === 'failed' ? 'dcbd-trk-warn' : 'dcbd-trk-err');
          return '<tr><td class="dcbd-trk-mono">' + esc(l.event_id) + '</td><td>' + esc(l.provider) + '</td><td>' + l.attempt_no + '</td><td><span class="dcbd-trk-status-pill ' + cls + '">' + esc(l.status) + '</span></td><td>' + esc(l.http_code) + '</td><td>' + l.latency_ms + 'ms</td><td>' + esc(l.error_message || l.response_summary) + '</td><td>' + esc(l.created_at) + '</td></tr>';
        }).join('') : '<tr><td colspan="8">No delivery logs yet.</td></tr>')
      + '</tbody></table></div></div>';
  }

  async function renderQueue(box) {
    var res = await apiGet('queue/list');
    var items = res.items || [];
    box.innerHTML = '<div class="dcbd-trk-card"><h3>Event Queue &amp; Dead-Letter Replay</h3><div class="dcbd-trk-table-wrap"><table class="dcbd-trk-table"><thead><tr><th>ID</th><th>Event ID</th><th>Event</th><th>Provider</th><th>Status</th><th>Attempts</th><th>Last Error</th><th>Action</th></tr></thead><tbody>'
      + (items.length ? items.map(function (q) {
          var canReplay = q.status === 'failed' || q.status === 'dead_letter';
          return '<tr><td>#' + q.id + '</td><td class="dcbd-trk-mono">' + esc(q.event_id) + '</td><td>' + esc(q.event_name) + '</td><td>' + esc(q.provider) + '</td><td><span class="dcbd-trk-status-pill">' + esc(q.status) + '</span></td><td>' + q.attempts + '/' + q.max_attempts + '</td><td>' + esc(q.last_error || '—') + '</td><td>' + (canReplay ? '<button class="dcbd-trk-btn dcbd-trk-btn-secondary dcbd-trk-btn-sm trk-replay-btn" data-id="' + q.id + '">Safe Replay</button>' : '—') + '</td></tr>';
        }).join('') : '<tr><td colspan="8">Queue is empty.</td></tr>')
      + '</tbody></table></div></div>';

    box.querySelectorAll('.trk-replay-btn').forEach(function (b) {
      b.onclick = async function () {
        var r = await apiPost('queue/replay', { queue_id: parseInt(b.getAttribute('data-id'), 10) });
        showToast(r.ok ? 'Queued for safe deduplicated replay.' : 'Replay failed', !r.ok);
        renderQueue(box);
      };
    });
  }

  async function renderPurchases(box) {
    var res = await apiGet('reports/purchases');
    var orders = res.orders || [];
    var byPay = res.by_payment_state || [];
    box.innerHTML = '<div class="dcbd-trk-grid">'
      + (byPay.length ? byPay.map(function (g) {
          return '<div class="dcbd-trk-card"><div class="dcbd-trk-kpi-label">' + esc(g.payment_state) + '</div><div class="dcbd-trk-kpi-val">' + g.cnt + ' orders</div><div class="dcbd-trk-kpi-sub">BDT ' + Number(g.total_val || 0).toFixed(2) + '</div></div>';
        }).join('') : '<div class="dcbd-trk-card"><div class="dcbd-trk-kpi-label">Authoritative Orders</div><div class="dcbd-trk-kpi-val">0</div></div>')
      + '</div><div class="dcbd-trk-card"><h3>Deduplicated Purchase Ledger</h3><div class="dcbd-trk-table-wrap"><table class="dcbd-trk-table"><thead><tr><th>Order ID</th><th>Event ID</th><th>Payment Method</th><th>Payment State</th><th>Subtotal</th><th>Shipping</th><th>Discount</th><th>Reported Value</th><th>Dispatched</th></tr></thead><tbody>'
      + (orders.length ? orders.map(function (o) {
          return '<tr><td class="dcbd-trk-mono">' + esc(o.order_id) + '</td><td class="dcbd-trk-mono">' + esc(o.event_id) + '</td><td>' + esc(o.payment_method) + '</td><td>' + esc(o.payment_state) + '</td><td>' + o.subtotal + '</td><td>' + o.shipping + '</td><td>' + o.discount + '</td><td><strong>' + esc(o.currency) + ' ' + o.total_value + '</strong></td><td>' + esc(o.dispatched_at) + '</td></tr>';
        }).join('') : '<tr><td colspan="9">No server purchases recorded yet.</td></tr>')
      + '</tbody></table></div></div>';
  }

  async function renderConsent(box) {
    var res = await apiGet('settings/get');
    var s = res.settings || {};
    box.innerHTML = '<div class="dcbd-trk-card"><h3>Consent, Privacy &amp; Order Trigger Rules</h3><form id="trk-consent-form" class="dcbd-trk-form">'
      + '<div class="dcbd-trk-switch-row"><span>Show Storefront Consent Banner (Disabled by default to preserve 100% existing design)</span><input type="checkbox" name="consent_banner_enabled" ' + (s.consent_banner_enabled ? 'checked' : '') + ' /></div>'
      + '<div class="dcbd-trk-switch-row"><span>Respect Global Privacy Control (GPC) / Do Not Track</span><input type="checkbox" name="consent_respect_gpc_dnt" ' + (s.consent_respect_gpc_dnt ? 'checked' : '') + ' /></div>'
      + '<div class="dcbd-trk-switch-row"><span>Purchase Value Includes Delivery Fee</span><input type="checkbox" name="value_includes_shipping" ' + (s.value_includes_shipping ? 'checked' : '') + ' /></div>'
      + '<div class="dcbd-trk-form-grid">'
      + '<label>Purchase Trigger Rule<select name="purchase_trigger_rule"><option value="order_placed" ' + (s.purchase_trigger_rule === 'order_placed' ? 'selected' : '') + '>Confirmed Order Placement (COD & Online tagged separately)</option><option value="verified_paid_only" ' + (s.purchase_trigger_rule === 'verified_paid_only' ? 'selected' : '') + '>Verified Paid / Delivered Orders Only</option></select></label>'
      + '<label>Default Analytics Consent<select name="consent_default_analytics"><option value="granted" ' + (s.consent_default_analytics === 'granted' ? 'selected' : '') + '>Granted</option><option value="denied" ' + (s.consent_default_analytics === 'denied' ? 'selected' : '') + '>Denied (Opt-in)</option></select></label>'
      + '<label>Default Marketing Consent<select name="consent_default_marketing"><option value="granted" ' + (s.consent_default_marketing === 'granted' ? 'selected' : '') + '>Granted</option><option value="denied" ' + (s.consent_default_marketing === 'denied' ? 'selected' : '') + '>Denied (Opt-in)</option></select></label>'
      + '<label>Data Retention (Days)<input type="number" name="retention_days" min="7" max="365" value="' + esc(s.retention_days || 90) + '" /></label>'
      + '</div>'
      + '<label>Consent Banner Text (Bengali)<textarea name="consent_banner_text_bn" rows="2">' + esc(s.consent_banner_text_bn || '') + '</textarea></label>'
      + '<div><button type="submit" class="dcbd-trk-btn dcbd-trk-btn-primary">Save Privacy &amp; Order Rules</button></div></form></div>';

    document.getElementById('trk-consent-form').onsubmit = async function (e) {
      e.preventDefault();
      var f = e.target.elements;
      var upd = {
        consent_banner_enabled: Boolean(f.consent_banner_enabled.checked),
        consent_respect_gpc_dnt: Boolean(f.consent_respect_gpc_dnt.checked),
        value_includes_shipping: Boolean(f.value_includes_shipping.checked),
        purchase_trigger_rule: f.purchase_trigger_rule.value,
        consent_default_analytics: f.consent_default_analytics.value,
        consent_default_marketing: f.consent_default_marketing.value,
        retention_days: parseInt(f.retention_days.value, 10) || 90,
        consent_banner_text_bn: f.consent_banner_text_bn.value.trim()
      };
      var r = await apiPost('settings/save', { settings: upd });
      showToast(r.ok ? 'Privacy & order rules saved.' : (r.error || 'Error'), !r.ok);
    };
  }

  async function renderUsers(box) {
    var res = await apiGet('users/list');
    if (!res.ok) { box.innerHTML = '<div class="dcbd-trk-alert">' + esc(res.error) + '</div>'; return; }
    var users = res.users || [];
    box.innerHTML = '<div class="dcbd-trk-card"><h3>Tracking Admin Users &amp; Roles</h3><table class="dcbd-trk-table"><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Last Login</th></tr></thead><tbody>'
      + users.map(function (u) {
          return '<tr><td class="dcbd-trk-mono">' + esc(u.username) + '</td><td>' + esc(u.display_name) + '</td><td><span class="dcbd-trk-status-pill">' + esc(u.role) + '</span></td><td>' + esc(u.last_login_at || 'Never') + '</td></tr>';
        }).join('')
      + '</tbody></table></div>'
      + '<div class="dcbd-trk-card"><h3>Create Tracking User (Super Admin Only)</h3><form id="trk-user-form" class="dcbd-trk-form"><div class="dcbd-trk-form-grid">'
      + '<label>Username<input type="text" name="username" required minlength="3" /></label>'
      + '<label>Display Name<input type="text" name="display_name" required /></label>'
      + '<label>Role<select name="role"><option value="viewer">Viewer (Read-only)</option><option value="analyst">Analyst</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></label>'
      + '<label>Password (min 8 chars)<input type="password" name="password" required minlength="8" /></label>'
      + '</div><div><button type="submit" class="dcbd-trk-btn dcbd-trk-btn-primary">Create User</button></div></form></div>';

    document.getElementById('trk-user-form').onsubmit = async function (e) {
      e.preventDefault();
      var f = e.target.elements;
      var r = await apiPost('users/create', {
        username: f.username.value.trim(),
        display_name: f.display_name.value.trim(),
        role: f.role.value,
        password: f.password.value
      });
      showToast(r.ok ? 'User created.' : (r.error || 'Failed'), !r.ok);
      if (r.ok) renderUsers(box);
    };
  }

  async function renderAudit(box) {
    var res = await apiGet('audit/list');
    if (!res.ok) { box.innerHTML = '<div class="dcbd-trk-alert">' + esc(res.error) + '</div>'; return; }
    var items = res.items || [];
    box.innerHTML = '<div class="dcbd-trk-card"><h3>Admin Audit Logs</h3><div class="dcbd-trk-table-wrap"><table class="dcbd-trk-table"><thead><tr><th>Time</th><th>Actor</th><th>Role</th><th>Action</th><th>Target</th><th>Details</th><th>IP</th></tr></thead><tbody>'
      + (items.length ? items.map(function (a) {
          return '<tr><td>' + esc(a.created_at) + '</td><td class="dcbd-trk-mono">' + esc(a.actor_username) + '</td><td>' + esc(a.actor_role) + '</td><td><strong>' + esc(a.action) + '</strong></td><td class="dcbd-trk-mono">' + esc(a.target) + '</td><td class="dcbd-trk-mono">' + esc(a.details_json) + '</td><td class="dcbd-trk-mono">' + esc(a.ip_address) + '</td></tr>';
        }).join('') : '<tr><td colspan="7">No audit logs yet.</td></tr>')
      + '</tbody></table></div></div>';
  }

  async function renderHealth(box) {
    var res = await apiGet('health');
    if (!res.ok) { box.innerHTML = '<div class="dcbd-trk-alert">' + esc(res.error) + '</div>'; return; }
    var d = res.diagnostics;
    box.innerHTML = '<div class="dcbd-trk-card"><h3>System Health &amp; Diagnostics</h3><pre class="dcbd-trk-pre">' + esc(JSON.stringify(d, null, 2)) + '</pre></div>';
  }

  // Event wiring
  document.getElementById('dcbd-trk-login-form').onsubmit = async function (e) {
    e.preventDefault();
    var errEl = document.getElementById('trk-login-error');
    errEl.classList.add('dcbd-trk-hidden');
    var r = await apiPost('auth/login', {
      username: document.getElementById('trk-login-user').value.trim(),
      password: document.getElementById('trk-login-pass').value
    });
    if (r.ok && r.authenticated) {
      state.user = r.user;
      state.csrf = r.csrf;
      setAuthUI(true);
      await loadTab('overview');
    } else {
      errEl.textContent = r.error || 'Login failed';
      errEl.classList.remove('dcbd-trk-hidden');
    }
  };

  document.getElementById('trk-btn-logout').onclick = async function () {
    await apiPost('auth/logout', {});
    state.user = null;
    setAuthUI(false);
  };

  document.getElementById('dcbd-trk-nav').onclick = function (e) {
    var btn = e.target.closest('button[data-tab]');
    if (btn) loadTab(btn.getAttribute('data-tab'));
  };

  document.getElementById('trk-btn-refresh').onclick = function () { loadTab(state.tab); };
  document.getElementById('trk-btn-run-worker').onclick = async function () {
    var r = await apiPost('queue/run_worker', {});
    showToast(r.ok ? ('Worker ran: ' + JSON.stringify(r.stats)) : (r.error || 'Failed'), !r.ok);
    loadTab(state.tab);
  };
  document.getElementById('trk-modal-close').onclick = function () {
    document.getElementById('trk-event-modal').classList.add('dcbd-trk-hidden');
  };

  checkSession();
})();
