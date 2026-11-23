<?php
/**
 * Dream Cart BD — Isolated SQLite3 Tracking Database & Migrations (tracking/db.php)
 * Uses a dedicated database file (storage/tracking.sqlite) so existing website tables
 * in storage/dreamcartbd.sqlite are NEVER altered, locked, or affected.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/crypto.php';

class DcbdTrackingDb {
    private static ?PDO $pdo = null;

    public static function pdo(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        if (!class_exists('PDO') || !in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            throw new RuntimeException('PDO SQLite driver is not available on this server.');
        }

        // Protect storage directory against direct web download via .htaccess
        $htaccessPath = DCBD_TRK_STORAGE_DIR . '/.htaccess';
        if (!is_file($htaccessPath)) {
            @file_put_contents($htaccessPath, "Require all denied\nDeny from all\n");
        }

        $pdo = new PDO('sqlite:' . DCBD_TRK_DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA journal_mode = WAL;');
        $pdo->exec('PRAGMA synchronous = NORMAL;');
        $pdo->exec('PRAGMA busy_timeout = 5000;');
        $pdo->exec('PRAGMA foreign_keys = ON;');

        self::$pdo = $pdo;
        self::migrate($pdo);
        return self::$pdo;
    }

    public static function migrate(PDO $pdo): void {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS dcbd_trk_settings (
                setting_key TEXT PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS dcbd_trk_secrets (
                secret_key TEXT PRIMARY KEY,
                encrypted_value TEXT NOT NULL,
                masked_preview TEXT NOT NULL,
                updated_by TEXT NOT NULL DEFAULT 'system',
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS dcbd_trk_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL UNIQUE,
                schema_version TEXT NOT NULL DEFAULT '1.0.0',
                event_name TEXT NOT NULL,
                event_time INTEGER NOT NULL,
                event_source_url TEXT NOT NULL DEFAULT '',
                action_source TEXT NOT NULL DEFAULT 'website',
                currency TEXT NOT NULL DEFAULT 'BDT',
                value REAL NOT NULL DEFAULT 0,
                order_id TEXT NOT NULL DEFAULT '',
                payment_state TEXT NOT NULL DEFAULT '',
                consent_state_json TEXT NOT NULL DEFAULT '{}',
                attribution_json TEXT NOT NULL DEFAULT '{}',
                items_json TEXT NOT NULL DEFAULT '[]',
                user_context_json TEXT NOT NULL DEFAULT '{}',
                payload_json TEXT NOT NULL DEFAULT '{}',
                is_test INTEGER NOT NULL DEFAULT 0,
                source_origin TEXT NOT NULL DEFAULT 'browser',
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_trk_events_name_time ON dcbd_trk_events(event_name, event_time DESC);
            CREATE INDEX IF NOT EXISTS idx_trk_events_order ON dcbd_trk_events(order_id);

            CREATE TABLE IF NOT EXISTS dcbd_trk_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                attempts INTEGER NOT NULL DEFAULT 0,
                max_attempts INTEGER NOT NULL DEFAULT 5,
                next_attempt_at INTEGER NOT NULL,
                lease_token TEXT DEFAULT NULL,
                lease_expires_at INTEGER DEFAULT NULL,
                last_http_code INTEGER DEFAULT NULL,
                last_error TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(event_id, provider)
            );
            CREATE INDEX IF NOT EXISTS idx_trk_queue_status_next ON dcbd_trk_queue(status, next_attempt_at);

            CREATE TABLE IF NOT EXISTS dcbd_trk_delivery_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue_id INTEGER NOT NULL,
                event_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                attempt_no INTEGER NOT NULL,
                status TEXT NOT NULL,
                http_code INTEGER DEFAULT NULL,
                latency_ms INTEGER NOT NULL DEFAULT 0,
                response_summary TEXT NOT NULL DEFAULT '',
                error_message TEXT NOT NULL DEFAULT '',
                is_test INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_trk_logs_event ON dcbd_trk_delivery_logs(event_id);
            CREATE INDEX IF NOT EXISTS idx_trk_logs_provider_created ON dcbd_trk_delivery_logs(provider, created_at DESC);

            CREATE TABLE IF NOT EXISTS dcbd_trk_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                milestone TEXT NOT NULL,
                event_id TEXT NOT NULL UNIQUE,
                order_status TEXT NOT NULL DEFAULT '',
                payment_method TEXT NOT NULL DEFAULT '',
                payment_status TEXT NOT NULL DEFAULT '',
                payment_state TEXT NOT NULL DEFAULT '',
                subtotal REAL NOT NULL DEFAULT 0,
                shipping REAL NOT NULL DEFAULT 0,
                discount REAL NOT NULL DEFAULT 0,
                total_value REAL NOT NULL DEFAULT 0,
                currency TEXT NOT NULL DEFAULT 'BDT',
                dispatched_at TEXT NOT NULL,
                UNIQUE(order_id, milestone)
            );
            CREATE INDEX IF NOT EXISTS idx_trk_orders_created ON dcbd_trk_orders(dispatched_at DESC);

            CREATE TABLE IF NOT EXISTS dcbd_trk_consent (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_hash TEXT NOT NULL,
                necessary INTEGER NOT NULL DEFAULT 1,
                analytics INTEGER NOT NULL DEFAULT 0,
                marketing INTEGER NOT NULL DEFAULT 0,
                gpc_signal INTEGER NOT NULL DEFAULT 0,
                policy_version TEXT NOT NULL DEFAULT '1.0',
                source TEXT NOT NULL DEFAULT 'default',
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_trk_consent_session ON dcbd_trk_consent(session_hash, created_at DESC);

            CREATE TABLE IF NOT EXISTS dcbd_trk_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                display_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'viewer',
                password_hash TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                locked_until INTEGER NOT NULL DEFAULT 0,
                last_login_at TEXT DEFAULT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS dcbd_trk_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_username TEXT NOT NULL,
                actor_role TEXT NOT NULL,
                action TEXT NOT NULL,
                target TEXT NOT NULL DEFAULT '',
                details_json TEXT NOT NULL DEFAULT '{}',
                ip_address TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_trk_audit_created ON dcbd_trk_audit_logs(created_at DESC);

            CREATE TABLE IF NOT EXISTS dcbd_trk_rate_limits (
                bucket_key TEXT PRIMARY KEY,
                window_start INTEGER NOT NULL,
                hit_count INTEGER NOT NULL DEFAULT 0
            );
        ");

        self::seedDefaults($pdo);
    }

    private static function seedDefaults(PDO $pdo): void {
        $now = date('c');
        $defaults = dcbd_trk_default_settings();
        $stmt = $pdo->prepare('INSERT OR IGNORE INTO dcbd_trk_settings (setting_key, setting_value, updated_at) VALUES (:k, :v, :t)');
        foreach ($defaults as $k => $v) {
            $stmt->execute([
                ':k' => $k,
                ':v' => json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ':t' => $now,
            ]);
        }

        // Seed initial admin user ONLY if no users exist yet
        $count = (int)$pdo->query('SELECT COUNT(*) FROM dcbd_trk_users')->fetchColumn();
        if ($count === 0) {
            $adminUser = dcbd_trk_env('DCBD_TRK_ADMIN_USERNAME', 'admin');
            $adminPass = dcbd_trk_env('DCBD_TRK_ADMIN_PASSWORD', '');
            if ($adminPass === '' || $adminPass === 'CHANGE_ME_STRONG_ADMIN_PASSWORD') {
                // Generate secure one-time bootstrap password file in storage/ (never hardcoded in repo)
                $bootstrapFile = DCBD_TRK_STORAGE_DIR . '/.trk_initial_admin_password.txt';
                if (is_file($bootstrapFile)) {
                    $adminPass = trim((string)@file_get_contents($bootstrapFile));
                }
                if ($adminPass === '') {
                    $adminPass = 'DCBD-' . bin2hex(random_bytes(8));
                    @file_put_contents($bootstrapFile, $adminPass . "\n", LOCK_EX);
                    @chmod($bootstrapFile, 0600);
                }
            }
            $uStmt = $pdo->prepare('INSERT INTO dcbd_trk_users (username, display_name, role, password_hash, is_active, created_at) VALUES (:u, :d, :r, :p, 1, :t)');
            $uStmt->execute([
                ':u' => $adminUser,
                ':d' => 'Tracking Super Admin',
                ':r' => 'super_admin',
                ':p' => password_hash($adminPass, PASSWORD_DEFAULT),
                ':t' => $now,
            ]);
        }
    }

    public static function getSettings(): array {
        $pdo = self::pdo();
        $settings = dcbd_trk_default_settings();
        $rows = $pdo->query('SELECT setting_key, setting_value FROM dcbd_trk_settings')->fetchAll();
        foreach ($rows as $row) {
            $decoded = json_decode((string)$row['setting_value'], true);
            $settings[$row['setting_key']] = $decoded;
        }
        return $settings;
    }

    public static function saveSettings(array $updates): array {
        $pdo = self::pdo();
        $defaults = dcbd_trk_default_settings();
        $now = date('c');
        $stmt = $pdo->prepare('INSERT INTO dcbd_trk_settings (setting_key, setting_value, updated_at) VALUES (:k, :v, :t) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at');
        foreach ($updates as $k => $v) {
            if (!array_key_exists($k, $defaults)) continue;
            $stmt->execute([
                ':k' => $k,
                ':v' => json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ':t' => $now,
            ]);
        }
        return self::getSettings();
    }

    public static function getSecret(string $secretKey): string {
        $map = dcbd_trk_secret_keys();
        if (!isset($map[$secretKey])) return '';

        $pdo = self::pdo();
        $stmt = $pdo->prepare('SELECT encrypted_value FROM dcbd_trk_secrets WHERE secret_key = :k');
        $stmt->execute([':k' => $secretKey]);
        $row = $stmt->fetch();
        if ($row && !empty($row['encrypted_value'])) {
            $decrypted = DcbdTrackingCrypto::decrypt((string)$row['encrypted_value']);
            if ($decrypted !== '') return $decrypted;
        }

        // Fallback to server environment variable if set
        return dcbd_trk_env($map[$secretKey], '');
    }

    public static function setSecret(string $secretKey, string $plaintext, string $actor = 'admin'): array {
        $map = dcbd_trk_secret_keys();
        if (!isset($map[$secretKey])) {
            throw new InvalidArgumentException('Unknown secret key: ' . $secretKey);
        }
        $pdo = self::pdo();
        $now = date('c');
        if ($plaintext === '') {
            $del = $pdo->prepare('DELETE FROM dcbd_trk_secrets WHERE secret_key = :k');
            $del->execute([':k' => $secretKey]);
            return ['configured' => false, 'masked' => ''];
        }
        $enc = DcbdTrackingCrypto::encrypt($plaintext);
        $mask = DcbdTrackingCrypto::mask($plaintext);
        $stmt = $pdo->prepare('INSERT INTO dcbd_trk_secrets (secret_key, encrypted_value, masked_preview, updated_by, updated_at) VALUES (:k, :e, :m, :a, :t) ON CONFLICT(secret_key) DO UPDATE SET encrypted_value = excluded.encrypted_value, masked_preview = excluded.masked_preview, updated_by = excluded.updated_by, updated_at = excluded.updated_at');
        $stmt->execute([
            ':k' => $secretKey,
            ':e' => $enc,
            ':m' => $mask,
            ':a' => $actor,
            ':t' => $now,
        ]);
        return ['configured' => true, 'masked' => $mask, 'updated_at' => $now];
    }

    public static function getMaskedSecrets(): array {
        $pdo = self::pdo();
        $rows = $pdo->query('SELECT secret_key, masked_preview, updated_by, updated_at FROM dcbd_trk_secrets')->fetchAll();
        $byKey = [];
        foreach ($rows as $r) {
            $byKey[$r['secret_key']] = $r;
        }
        $out = [];
        foreach (dcbd_trk_secret_keys() as $k => $envVar) {
            if (isset($byKey[$k])) {
                $out[$k] = [
                    'configured' => true,
                    'source'     => 'encrypted_db',
                    'masked'     => $byKey[$k]['masked_preview'],
                    'updated_by' => $byKey[$k]['updated_by'],
                    'updated_at' => $byKey[$k]['updated_at'],
                ];
            } else {
                $envVal = dcbd_trk_env($envVar, '');
                $out[$k] = [
                    'configured' => $envVal !== '',
                    'source'     => $envVal !== '' ? 'env' : 'none',
                    'masked'     => $envVal !== '' ? DcbdTrackingCrypto::mask($envVal) : '',
                    'updated_by' => $envVal !== '' ? 'env' : '',
                    'updated_at' => '',
                ];
            }
        }
        return $out;
    }

    public static function writeAuditLog(string $actor, string $role, string $action, string $target = '', array $details = []): void {
        try {
            // Strip any accidental secret values before logging
            foreach ($details as $dk => $dv) {
                if (preg_match('/token|secret|password|key/i', (string)$dk)) {
                    $details[$dk] = '[REDACTED]';
                }
            }
            $pdo = self::pdo();
            $stmt = $pdo->prepare('INSERT INTO dcbd_trk_audit_logs (actor_username, actor_role, action, target, details_json, ip_address, created_at) VALUES (:u, :r, :a, :tg, :d, :ip, :t)');
            $stmt->execute([
                ':u'  => $actor,
                ':r'  => $role,
                ':a'  => $action,
                ':tg' => $target,
                ':d'  => json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ':ip' => dcbd_trk_client_ip(),
                ':t'  => date('c'),
            ]);
        } catch (Throwable $e) {}
    }

    public static function checkRateLimit(string $bucketKey, int $maxHits, int $windowSeconds): bool {
        $pdo = self::pdo();
        $now = time();
        $stmt = $pdo->prepare('SELECT window_start, hit_count FROM dcbd_trk_rate_limits WHERE bucket_key = :k');
        $stmt->execute([':k' => $bucketKey]);
        $row = $stmt->fetch();

        if (!$row || ($now - (int)$row['window_start']) >= $windowSeconds) {
            $up = $pdo->prepare('INSERT INTO dcbd_trk_rate_limits (bucket_key, window_start, hit_count) VALUES (:k, :w, 1) ON CONFLICT(bucket_key) DO UPDATE SET window_start = excluded.window_start, hit_count = 1');
            $up->execute([':k' => $bucketKey, ':w' => $now]);
            return true;
        }

        if ((int)$row['hit_count'] >= $maxHits) {
            return false;
        }

        $inc = $pdo->prepare('UPDATE dcbd_trk_rate_limits SET hit_count = hit_count + 1 WHERE bucket_key = :k');
        $inc->execute([':k' => $bucketKey]);
        return true;
    }
}
