<?php
/**
 * Dream Cart BD — Protected Tracking Admin Dashboard API (tracking/api/admin.php)
 * Security controls:
 * - Secure PHP sessions (HttpOnly, SameSite=Strict, Secure over HTTPS)
 * - Login throttling (5 failed attempts -> 15 min lockout)
 * - Role-Based Access Control (super_admin, admin, analyst, viewer)
 * - Strict CSRF token verification on all state-changing POST requests
 * - Secret masking (never returns raw API tokens or secrets)
 * - Full Admin Audit Logging
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, no-cache, must-revalidate');

$isHttps = dcbd_trk_is_https();
session_name('DCBD_TRK_SESS');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $isHttps,
    'httponly' => true,
    'samesite' => 'Strict',
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function trk_json(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function trk_csrf_token(): string {
    if (empty($_SESSION['dcbd_trk_csrf'])) {
        $_SESSION['dcbd_trk_csrf'] = bin2hex(random_bytes(32));
    }
    return (string)$_SESSION['dcbd_trk_csrf'];
}

function trk_require_auth(array $allowedRoles = ['super_admin', 'admin', 'analyst', 'viewer']): array {
    if (empty($_SESSION['dcbd_trk_user']) || !is_array($_SESSION['dcbd_trk_user'])) {
        trk_json(['ok' => false, 'error' => 'Authentication required'], 401);
    }
    $user = $_SESSION['dcbd_trk_user'];
    if (!in_array((string)($user['role'] ?? ''), $allowedRoles, true)) {
        trk_json(['ok' => false, 'error' => 'Insufficient permissions for this action'], 403);
    }
    return $user;
}

function trk_require_csrf(): void {
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $expected = (string)($_SESSION['dcbd_trk_csrf'] ?? '');
    if ($expected === '' || $provided === '' || !hash_equals($expected, $provided)) {
        trk_json(['ok' => false, 'error' => 'Invalid or missing CSRF token'], 403);
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = trim((string)($_GET['action'] ?? ''));
$body = [];
if ($method === 'POST') {
    $raw = (string)@file_get_contents('php://input', false, null, 0, 131072);
    $parsed = @json_decode($raw, true);
    if (is_array($parsed)) {
        $body = $parsed;
        if ($action === '' && !empty($body['action'])) {
            $action = (string)$body['action'];
        }
    }
}

try {
    $pdo = DcbdTrackingDb::pdo();

    // --- AUTHENTICATION ENDPOINTS ---
    if ($action === 'auth/me') {
        if (empty($_SESSION['dcbd_trk_user'])) {
            trk_json(['ok' => true, 'authenticated' => false, 'csrf' => trk_csrf_token()]);
        }
        trk_json([
            'ok'            => true,
            'authenticated' => true,
            'user'          => $_SESSION['dcbd_trk_user'],
            'csrf'          => trk_csrf_token(),
        ]);
    }

    if ($action === 'auth/login' && $method === 'POST') {
        $ipBucket = 'admin_login:' . hash('sha256', dcbd_trk_client_ip());
        if (!DcbdTrackingDb::checkRateLimit($ipBucket, 20, 900)) {
            trk_json(['ok' => false, 'error' => 'Too many login attempts. Please wait 15 minutes.'], 429);
        }

        $username = trim((string)($body['username'] ?? ''));
        $password = (string)($body['password'] ?? '');
        if ($username === '' || $password === '') {
            trk_json(['ok' => false, 'error' => 'Username and password are required'], 400);
        }

        $stmt = $pdo->prepare('SELECT * FROM dcbd_trk_users WHERE username = :u LIMIT 1');
        $stmt->execute([':u' => $username]);
        $user = $stmt->fetch();

        $now = time();
        if (!$user || empty($user['is_active'])) {
            trk_json(['ok' => false, 'error' => 'Invalid credentials'], 401);
        }
        if ((int)$user['locked_until'] > $now) {
            trk_json(['ok' => false, 'error' => 'Account temporarily locked due to failed attempts'], 423);
        }

        if (!password_verify($password, (string)$user['password_hash'])) {
            $fails = ((int)$user['failed_attempts']) + 1;
            $lockUntil = $fails >= 5 ? ($now + 900) : 0;
            $pdo->prepare('UPDATE dcbd_trk_users SET failed_attempts = :f, locked_until = :l WHERE id = :id')
                ->execute([':f' => $fails, ':l' => $lockUntil, ':id' => (int)$user['id']]);
            DcbdTrackingDb::writeAuditLog($username, (string)$user['role'], 'auth.login_failed', $username, ['attempts' => $fails]);
            trk_json(['ok' => false, 'error' => 'Invalid credentials'], 401);
        }

        session_regenerate_id(true);
        $pdo->prepare('UPDATE dcbd_trk_users SET failed_attempts = 0, locked_until = 0, last_login_at = :dt WHERE id = :id')
            ->execute([':dt' => date('c'), ':id' => (int)$user['id']]);

        $_SESSION['dcbd_trk_user'] = [
            'id'           => (int)$user['id'],
            'username'     => (string)$user['username'],
            'display_name' => (string)$user['display_name'],
            'role'         => (string)$user['role'],
        ];
        $_SESSION['dcbd_trk_csrf'] = bin2hex(random_bytes(32));
        DcbdTrackingDb::writeAuditLog((string)$user['username'], (string)$user['role'], 'auth.login_success', (string)$user['username']);

        trk_json([
            'ok'            => true,
            'authenticated' => true,
            'user'          => $_SESSION['dcbd_trk_user'],
            'csrf'          => $_SESSION['dcbd_trk_csrf'],
        ]);
    }

    if ($action === 'auth/logout' && $method === 'POST') {
        $actor = $_SESSION['dcbd_trk_user']['username'] ?? 'unknown';
        $role = $_SESSION['dcbd_trk_user']['role'] ?? 'unknown';
        DcbdTrackingDb::writeAuditLog($actor, $role, 'auth.logout', $actor);
        $_SESSION = [];
        session_destroy();
        trk_json(['ok' => true]);
    }

    // --- ALL ROUTES BELOW REQUIRE AUTHENTICATION ---
    $user = trk_require_auth();
    if ($method === 'POST') {
        trk_require_csrf();
    }

    // 1. OVERVIEW & REAL METRICS
    if ($action === 'overview') {
        $settings = DcbdTrackingDb::getSettings();
        $totalEvents = (int)$pdo->query('SELECT COUNT(*) FROM dcbd_trk_events')->fetchColumn();
        $events24h = (int)$pdo->query("SELECT COUNT(*) FROM dcbd_trk_events WHERE event_time >= " . (time() - 86400))->fetchColumn();
        $queueCounts = [];
        foreach ($pdo->query('SELECT status, COUNT(*) AS cnt FROM dcbd_trk_queue GROUP BY status')->fetchAll() as $r) {
            $queueCounts[$r['status']] = (int)$r['cnt'];
        }
        $purchaseCount = (int)$pdo->query('SELECT COUNT(*) FROM dcbd_trk_orders')->fetchColumn();
        $purchaseValue = (float)$pdo->query('SELECT COALESCE(SUM(total_value), 0) FROM dcbd_trk_orders')->fetchColumn();
        $lastSuccess = $pdo->query("SELECT provider, created_at FROM dcbd_trk_delivery_logs WHERE status = 'delivered' ORDER BY id DESC LIMIT 1")->fetch() ?: null;
        $lastError = $pdo->query("SELECT provider, error_message, created_at FROM dcbd_trk_delivery_logs WHERE status IN ('failed', 'dead_letter') ORDER BY id DESC LIMIT 1")->fetch() ?: null;

        $eventBreakdown = $pdo->query('SELECT event_name, COUNT(*) AS cnt FROM dcbd_trk_events GROUP BY event_name ORDER BY cnt DESC LIMIT 15')->fetchAll();

        $adaptersStatus = [];
        foreach (DcbdTrackingAdapterRegistry::all() as $name => $adapter) {
            $adaptersStatus[] = [
                'name'         => $name,
                'display_name' => $adapter->getDisplayName(),
                'category'     => $adapter->getConsentCategory(),
                'enabled'      => $adapter->isEnabled($settings),
                'configured'   => $adapter->isConfigured($settings),
                'supports_test'=> $adapter->supportsTestEvent(),
            ];
        }

        trk_json([
            'ok' => true,
            'data' => [
                'master_enabled'  => !empty($settings['master_enabled']),
                'test_mode'       => !empty($settings['test_mode']),
                'total_events'    => $totalEvents,
                'events_24h'      => $events24h,
                'queue'           => [
                    'pending'     => $queueCounts['pending'] ?? 0,
                    'processing'  => $queueCounts['processing'] ?? 0,
                    'delivered'   => $queueCounts['delivered'] ?? 0,
                    'failed'      => $queueCounts['failed'] ?? 0,
                    'dead_letter' => $queueCounts['dead_letter'] ?? 0,
                ],
                'purchases'       => [
                    'count'       => $purchaseCount,
                    'total_value' => round($purchaseValue, 2),
                    'currency'    => 'BDT',
                ],
                'last_success'    => $lastSuccess,
                'last_error'      => $lastError,
                'event_breakdown' => $eventBreakdown,
                'adapters'        => $adaptersStatus,
            ],
        ]);
    }

    // 2, 3, 4, 10. SETTINGS & MASKED SECRETS
    if ($action === 'settings/get') {
        trk_json([
            'ok'       => true,
            'settings' => DcbdTrackingDb::getSettings(),
            'secrets'  => DcbdTrackingDb::getMaskedSecrets(),
        ]);
    }

    if ($action === 'settings/save' && $method === 'POST') {
        trk_require_auth(['super_admin', 'admin']);
        $updates = is_array($body['settings'] ?? null) ? $body['settings'] : [];
        $saved = DcbdTrackingDb::saveSettings($updates);
        DcbdTrackingDb::writeAuditLog($user['username'], $user['role'], 'settings.update', 'dcbd_trk_settings', ['keys' => array_keys($updates)]);
        trk_json(['ok' => true, 'settings' => $saved]);
    }

    if ($action === 'secrets/save' && $method === 'POST') {
        trk_require_auth(['super_admin', 'admin']);
        $secretKey = trim((string)($body['secret_key'] ?? ''));
        $secretVal = trim((string)($body['secret_value'] ?? ''));
        $res = DcbdTrackingDb::setSecret($secretKey, $secretVal, $user['username']);
        DcbdTrackingDb::writeAuditLog($user['username'], $user['role'], 'secrets.update', $secretKey, ['configured' => $res['configured']]);
        trk_json(['ok' => true, 'secret' => $res, 'secrets' => DcbdTrackingDb::getMaskedSecrets()]);
    }

    // TEST PROVIDER CONNECTION
    if ($action === 'providers/test' && $method === 'POST') {
        trk_require_auth(['super_admin', 'admin']);
        $provider = trim((string)($body['provider'] ?? ''));
        $adapter = DcbdTrackingAdapterRegistry::get($provider);
        if (!$adapter) {
            trk_json(['ok' => false, 'error' => 'Unknown provider'], 404);
        }
        $settings = DcbdTrackingDb::getSettings();
        $testEvent = [
            'schema_version'   => DCBD_TRK_SCHEMA_VERSION,
            'event_id'         => 'TEST_' . strtoupper($provider) . '_' . time(),
            'event_name'       => 'page_view',
            'event_time'       => time(),
            'event_source_url' => 'https://dreamcartbd.com/?dcbd_test=1',
            'action_source'    => 'website',
            'currency'         => 'BDT',
            'value'            => 0,
            'order_id'         => '',
            'payment_state'    => '',
            'items'            => [],
            'consent_state'    => ['necessary' => true, 'analytics' => true, 'marketing' => true],
            'attribution'      => [],
            'user_context'     => ['client_ip_address' => dcbd_trk_client_ip(), 'client_user_agent' => 'DreamCartBD-TestRunner/1.0', 'country_hash' => hash('sha256', 'bd')],
            'extra'            => ['page_title' => 'Dream Cart BD Tracking Connection Test'],
            'is_test'          => 1,
        ];
        if ($provider === 'tiktok_events_api') {
            $testEvent['event_name'] = 'view_item';
            $testEvent['items'] = [['item_id' => 'TEST-SKU', 'item_name' => 'Test Product', 'price' => 100, 'quantity' => 1]];
            $testEvent['value'] = 100;
        }
        if ($provider === 'google_ads') {
            $testEvent['event_name'] = 'purchase';
            $testEvent['order_id'] = 'TEST-ORD-' . time();
            $testEvent['value'] = 100;
        }
        $res = $adapter->send($testEvent, $settings, true);
        DcbdTrackingDb::writeAuditLog($user['username'], $user['role'], 'providers.test', $provider, ['ok' => $res['ok'], 'http_code' => $res['http_code']]);
        trk_json(['ok' => true, 'result' => $res]);
    }

    // 5. EVENT STREAM (Paginated & Filtered)
    if ($action === 'events/list') {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = max(10, min(100, (int)($_GET['per_page'] ?? 25)));
        $offset = ($page - 1) * $perPage;
        $eventName = trim((string)($_GET['event_name'] ?? ''));
        $search = trim((string)($_GET['q'] ?? ''));

        $where = [];
        $params = [];
        if ($eventName !== '') {
            $where[] = 'event_name = :en';
            $params[':en'] = $eventName;
        }
        if ($search !== '') {
            $where[] = '(event_id LIKE :q OR order_id LIKE :q OR event_source_url LIKE :q)';
            $params[':q'] = '%' . $search . '%';
        }
        $whereSql = empty($where) ? '' : ('WHERE ' . implode(' AND ', $where));

        $cStmt = $pdo->prepare("SELECT COUNT(*) FROM dcbd_trk_events {$whereSql}");
        $cStmt->execute($params);
        $total = (int)$cStmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT id, event_id, event_name, event_time, event_source_url, currency, value, order_id, payment_state, is_test, source_origin, created_at FROM dcbd_trk_events {$whereSql} ORDER BY id DESC LIMIT :lim OFFSET :off");
        foreach ($params as $pk => $pv) $stmt->bindValue($pk, $pv);
        $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();

        trk_json(['ok' => true, 'items' => $stmt->fetchAll(), 'total' => $total, 'page' => $page, 'per_page' => $perPage]);
    }

    // 6. EVENT DETAILS
    if ($action === 'events/detail') {
        $eventId = trim((string)($_GET['event_id'] ?? ''));
        $stmt = $pdo->prepare('SELECT * FROM dcbd_trk_events WHERE event_id = :eid LIMIT 1');
        $stmt->execute([':eid' => $eventId]);
        $ev = $stmt->fetch();
        if (!$ev) {
            trk_json(['ok' => false, 'error' => 'Event not found'], 404);
        }
        $qStmt = $pdo->prepare('SELECT * FROM dcbd_trk_queue WHERE event_id = :eid ORDER BY id ASC');
        $qStmt->execute([':eid' => $eventId]);
        $lStmt = $pdo->prepare('SELECT * FROM dcbd_trk_delivery_logs WHERE event_id = :eid ORDER BY id DESC');
        $lStmt->execute([':eid' => $eventId]);

        trk_json(['ok' => true, 'event' => $ev, 'queue' => $qStmt->fetchAll(), 'logs' => $lStmt->fetchAll()]);
    }

    // 7. DELIVERY LOGS
    if ($action === 'logs/list') {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = max(10, min(100, (int)($_GET['per_page'] ?? 25)));
        $offset = ($page - 1) * $perPage;
        $provider = trim((string)($_GET['provider'] ?? ''));
        $status = trim((string)($_GET['status'] ?? ''));

        $where = [];
        $params = [];
        if ($provider !== '') { $where[] = 'provider = :p'; $params[':p'] = $provider; }
        if ($status !== '') { $where[] = 'status = :s'; $params[':s'] = $status; }
        $whereSql = empty($where) ? '' : ('WHERE ' . implode(' AND ', $where));

        $cStmt = $pdo->prepare("SELECT COUNT(*) FROM dcbd_trk_delivery_logs {$whereSql}");
        $cStmt->execute($params);
        $total = (int)$cStmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT * FROM dcbd_trk_delivery_logs {$whereSql} ORDER BY id DESC LIMIT :lim OFFSET :off");
        foreach ($params as $pk => $pv) $stmt->bindValue($pk, $pv);
        $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();

        trk_json(['ok' => true, 'items' => $stmt->fetchAll(), 'total' => $total, 'page' => $page, 'per_page' => $perPage]);
    }

    // 8. FAILED EVENTS / RETRY QUEUE
    if ($action === 'queue/list') {
        $status = trim((string)($_GET['status'] ?? ''));
        $where = $status !== '' ? 'WHERE q.status = :s' : '';
        $stmt = $pdo->prepare("SELECT q.*, e.event_name, e.order_id, e.value, e.currency FROM dcbd_trk_queue q JOIN dcbd_trk_events e ON e.event_id = q.event_id {$where} ORDER BY q.id DESC LIMIT 100");
        if ($status !== '') $stmt->bindValue(':s', $status);
        $stmt->execute();
        trk_json(['ok' => true, 'items' => $stmt->fetchAll()]);
    }

    if ($action === 'queue/replay' && $method === 'POST') {
        trk_require_auth(['super_admin', 'admin']);
        $queueId = (int)($body['queue_id'] ?? 0);
        $ok = DcbdTrackingQueue::replayJob($queueId);
        DcbdTrackingDb::writeAuditLog($user['username'], $user['role'], 'queue.replay', (string)$queueId, ['replayed' => $ok]);
        trk_json(['ok' => $ok]);
    }

    if ($action === 'queue/run_worker' && $method === 'POST') {
        trk_require_auth(['super_admin', 'admin']);
        $stats = DcbdTrackingQueue::processBatch(25);
        DcbdTrackingDb::writeAuditLog($user['username'], $user['role'], 'queue.run_worker', 'manual', $stats);
        trk_json(['ok' => true, 'stats' => $stats]);
    }

    // 9. PURCHASE REPORTS
    if ($action === 'reports/purchases') {
        $orders = $pdo->query('SELECT * FROM dcbd_trk_orders ORDER BY id DESC LIMIT 100')->fetchAll();
        $byPayment = $pdo->query('SELECT payment_state, COUNT(*) AS cnt, COALESCE(SUM(total_value), 0) AS total_val FROM dcbd_trk_orders GROUP BY payment_state')->fetchAll();
        trk_json(['ok' => true, 'orders' => $orders, 'by_payment_state' => $byPayment]);
    }

    // 11. USER ROLES / PERMISSIONS
    if ($action === 'users/list') {
        trk_require_auth(['super_admin', 'admin']);
        $users = $pdo->query('SELECT id, username, display_name, role, is_active, last_login_at, created_at FROM dcbd_trk_users ORDER BY id ASC')->fetchAll();
        trk_json(['ok' => true, 'users' => $users]);
    }

    if ($action === 'users/create' && $method === 'POST') {
        trk_require_auth(['super_admin']);
        $u = trim((string)($body['username'] ?? ''));
        $dn = trim((string)($body['display_name'] ?? $u));
        $role = in_array((string)($body['role'] ?? 'viewer'), ['super_admin', 'admin', 'analyst', 'viewer'], true) ? (string)$body['role'] : 'viewer';
        $pw = (string)($body['password'] ?? '');
        if (strlen($u) < 3 || strlen($pw) < 8) {
            trk_json(['ok' => false, 'error' => 'Username (>=3 chars) and password (>=8 chars) required'], 400);
        }
        $stmt = $pdo->prepare('INSERT INTO dcbd_trk_users (username, display_name, role, password_hash, is_active, created_at) VALUES (:u, :dn, :r, :p, 1, :dt)');
        $stmt->execute([':u' => $u, ':dn' => $dn, ':r' => $role, ':p' => password_hash($pw, PASSWORD_DEFAULT), ':dt' => date('c')]);
        DcbdTrackingDb::writeAuditLog($user['username'], $user['role'], 'users.create', $u, ['role' => $role]);
        trk_json(['ok' => true]);
    }

    // 12. AUDIT LOGS
    if ($action === 'audit/list') {
        trk_require_auth(['super_admin', 'admin']);
        $logs = $pdo->query('SELECT * FROM dcbd_trk_audit_logs ORDER BY id DESC LIMIT 100')->fetchAll();
        trk_json(['ok' => true, 'items' => $logs]);
    }

    // 13. SYSTEM HEALTH / DIAGNOSTICS
    if ($action === 'health') {
        $dbSize = is_file(DCBD_TRK_DB_PATH) ? filesize(DCBD_TRK_DB_PATH) : 0;
        $consentCount = (int)$pdo->query('SELECT COUNT(*) FROM dcbd_trk_consent')->fetchColumn();
        trk_json([
            'ok' => true,
            'diagnostics' => [
                'tracking_version'   => DCBD_TRK_VERSION,
                'schema_version'     => DCBD_TRK_SCHEMA_VERSION,
                'php_version'        => PHP_VERSION,
                'sqlite_driver'      => in_array('sqlite', PDO::getAvailableDrivers(), true),
                'curl_available'     => function_exists('curl_init'),
                'openssl_gcm'        => function_exists('openssl_encrypt') && in_array('aes-256-gcm', openssl_get_cipher_methods(), true),
                'https_detected'     => dcbd_trk_is_https(),
                'db_size_bytes'      => $dbSize,
                'consent_records'    => $consentCount,
                'server_time_dhaka'  => date('c'),
                'cron_command'       => '* * * * * php ' . DCBD_TRK_ROOT . '/worker.php >/dev/null 2>&1',
            ],
        ]);
    }

    trk_json(['ok' => false, 'error' => 'Unknown action'], 404);
} catch (Throwable $e) {
    trk_json(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
