<?php
/**
 * Dream Cart BD — Secure Tracking, CAPI & Diagnostics Admin Dashboard (/admin/tracking/)
 * Standalone isolated admin portal with 13 modules; zero impact on existing AdminPortal.js.
 */
declare(strict_types=1);
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Dream Cart BD — Tracking &amp; Conversion API Admin Dashboard</title>
  <link rel="stylesheet" href="./assets/tracking-admin.css?v=1.0.0" />
</head>
<body class="dcbd-trk-body">
  <!-- Login View -->
  <div id="dcbd-trk-login-view" class="dcbd-trk-login-wrap">
    <div class="dcbd-trk-login-card">
      <div class="dcbd-trk-brand">
        <span class="dcbd-trk-badge">SECURE</span>
        <h1>Dream Cart BD Tracking</h1>
        <p>Multi-Platform Pixels, CAPI Queue &amp; Diagnostics</p>
      </div>
      <form id="dcbd-trk-login-form" class="dcbd-trk-form" autocomplete="off">
        <label>Username
          <input type="text" id="trk-login-user" required placeholder="admin" />
        </label>
        <label>Password
          <input type="password" id="trk-login-pass" required placeholder="••••••••" />
        </label>
        <div id="trk-login-error" class="dcbd-trk-alert dcbd-trk-hidden"></div>
        <button type="submit" class="dcbd-trk-btn dcbd-trk-btn-primary dcbd-trk-w-full">Sign In to Tracking Admin</button>
      </form>
      <p class="dcbd-trk-hint">Credentials are verified server-side with session cookies, CSRF tokens &amp; login throttling.</p>
    </div>
  </div>

  <!-- Authenticated Dashboard Shell -->
  <div id="dcbd-trk-app" class="dcbd-trk-shell dcbd-trk-hidden">
    <aside class="dcbd-trk-sidebar">
      <div class="dcbd-trk-side-head">
        <h2>DCBD Tracking</h2>
        <span id="trk-user-pill" class="dcbd-trk-pill"></span>
      </div>
      <nav class="dcbd-trk-nav" id="dcbd-trk-nav">
        <button data-tab="overview" class="active">1. Overview</button>
        <button data-tab="connections">2. Platform Connections</button>
        <button data-tab="pixels">3. Pixel / Measurement IDs</button>
        <button data-tab="credentials">4. Server API Credentials</button>
        <button data-tab="events">5. Event Stream</button>
        <button data-tab="logs">6. Delivery Logs</button>
        <button data-tab="queue">7. Failed Events / Retry Queue</button>
        <button data-tab="purchases">8. Purchase Reports</button>
        <button data-tab="consent">9. Consent &amp; Privacy</button>
        <button data-tab="users">10. User Roles &amp; Permissions</button>
        <button data-tab="audit">11. Audit Logs</button>
        <button data-tab="health">12. System Health &amp; Diagnostics</button>
      </nav>
      <div class="dcbd-trk-side-foot">
        <button id="trk-btn-logout" class="dcbd-trk-btn dcbd-trk-btn-outline dcbd-trk-w-full">Sign Out</button>
      </div>
    </aside>

    <main class="dcbd-trk-main">
      <header class="dcbd-trk-topbar">
        <h1 id="trk-page-title">Overview</h1>
        <div class="dcbd-trk-top-actions">
          <span id="trk-master-badge" class="dcbd-trk-status-pill">Loading...</span>
          <button id="trk-btn-run-worker" class="dcbd-trk-btn dcbd-trk-btn-secondary">Run Queue Worker</button>
          <button id="trk-btn-refresh" class="dcbd-trk-btn dcbd-trk-btn-outline">Refresh</button>
        </div>
      </header>
      <div id="trk-toast" class="dcbd-trk-toast dcbd-trk-hidden"></div>
      <section id="trk-view-container" class="dcbd-trk-content"></section>
    </main>
  </div>

  <!-- Module 6/Event Details Modal -->
  <div id="trk-event-modal" class="dcbd-trk-modal dcbd-trk-hidden" role="dialog" aria-modal="true">
    <div class="dcbd-trk-modal-box">
      <div class="dcbd-trk-modal-head">
        <h3>Event Details</h3>
        <button id="trk-modal-close" class="dcbd-trk-btn dcbd-trk-btn-outline">Close</button>
      </div>
      <div id="trk-event-modal-body" class="dcbd-trk-modal-body"></div>
    </div>
  </div>

  <script defer src="./assets/tracking-admin.js?v=1.0.0"></script>
</body>
</html>
