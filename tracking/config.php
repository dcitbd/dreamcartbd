<?php
/**
 * Dream Cart BD — Isolated Tracking Module Configuration (tracking/config.php)
 * Loads protected server-side environment variables (.env) and defines isolated storage paths.
 * Zero dependency on or modification of existing website globals.
 */

declare(strict_types=1);

if (!defined('DCBD_TRK_INIT')) {
    define('DCBD_TRK_INIT', true);
}

date_default_timezone_set('Asia/Dhaka');

define('DCBD_TRK_VERSION', '1.0.0');
define('DCBD_TRK_SCHEMA_VERSION', '1.0.0');
define('DCBD_TRK_ROOT', __DIR__);
define('DCBD_TRK_SITE_ROOT', dirname(__DIR__));
define('DCBD_TRK_STORAGE_DIR', DCBD_TRK_SITE_ROOT . '/storage');
define('DCBD_TRK_DB_PATH', DCBD_TRK_STORAGE_DIR . '/tracking.sqlite');
define('DCBD_TRK_LOG_DIR', DCBD_TRK_STORAGE_DIR . '/logs');

foreach ([DCBD_TRK_STORAGE_DIR, DCBD_TRK_LOG_DIR] as $_trkDir) {
    if (!is_dir($_trkDir)) {
        @mkdir($_trkDir, 0750, true);
    }
}

/**
 * Lightweight .env file parser (read-only, never overrides real server env vars)
 */
function dcbd_trk_load_env(): void {
    static $loaded = false;
    if ($loaded) return;
    $loaded = true;

    $candidates = [
        DCBD_TRK_SITE_ROOT . '/.env',
        DCBD_TRK_ROOT . '/.env',
    ];
    foreach ($candidates as $file) {
        if (!is_file($file) || !is_readable($file)) continue;
        $lines = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (!is_array($lines)) continue;
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || $trimmed[0] === '#') continue;
            $pos = strpos($trimmed, '=');
            if ($pos === false) continue;
            $key = trim(substr($trimmed, 0, $pos));
            $val = trim(substr($trimmed, $pos + 1));
            if ($key === '') continue;
            if ((str_starts_with($val, '"') && str_ends_with($val, '"')) || (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                $val = substr($val, 1, -1);
            }
            if (getenv($key) === false && !isset($_ENV[$key])) {
                $_ENV[$key] = $val;
                @putenv($key . '=' . $val);
            }
        }
    }
}

function dcbd_trk_env(string $key, string $default = ''): string {
    dcbd_trk_load_env();
    $val = getenv($key);
    if ($val !== false && $val !== '') {
        return (string)$val;
    }
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return (string)$_ENV[$key];
    }
    return $default;
}

function dcbd_trk_allowed_origins(): array {
    $raw = dcbd_trk_env('DCBD_TRK_ALLOWED_ORIGINS', 'https://dreamcartbd.com,https://www.dreamcartbd.com');
    $list = array_filter(array_map('trim', explode(',', $raw)));
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host !== '') {
        $scheme = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') ? 'https' : 'http';
        $list[] = $scheme . '://' . $host;
    }
    return array_values(array_unique($list));
}

function dcbd_trk_is_https(): bool {
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') return true;
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') return true;
    return isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443;
}

function dcbd_trk_client_ip(): string {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $k) {
        if (!empty($_SERVER[$k])) {
            $ip = trim(explode(',', (string)$_SERVER[$k])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

/**
 * Default platform & privacy settings (all third-party integrations blank/disabled until owner configures them)
 */
function dcbd_trk_default_settings(): array {
    return [
        // Master & Mode
        'master_enabled'                => true,
        'test_mode'                     => false,
        'purchase_trigger_rule'         => 'order_placed', // 'order_placed' | 'verified_paid_only'
        'value_includes_shipping'       => true,
        'retention_days'                => (int)dcbd_trk_env('DCBD_TRK_RETENTION_DAYS', '90'),

        // Platform Enable Switches (independently toggleable)
        'meta_pixel_enabled'            => false,
        'meta_capi_enabled'             => false,
        'gtm_enabled'                   => false,
        'ga4_enabled'                   => false,
        'ga4_mp_enabled'                => false,
        'google_ads_enabled'            => false,
        'google_ads_ec_enabled'         => false,
        'tiktok_pixel_enabled'          => false,
        'tiktok_events_api_enabled'     => false,
        'clarity_enabled'               => false,
        'pinterest_enabled'             => false,
        'snapchat_enabled'              => false,

        // Public Browser IDs (non-secret; blank until owner supplies)
        'gtm_container_id'              => dcbd_trk_env('GTM_CONTAINER_ID', ''),
        'ga4_measurement_id'            => dcbd_trk_env('GA4_MEASUREMENT_ID', ''),
        'google_ads_conversion_id'      => dcbd_trk_env('GOOGLE_ADS_CONVERSION_ID', ''),
        'google_ads_conversion_label'   => dcbd_trk_env('GOOGLE_ADS_CONVERSION_LABEL', ''),
        'meta_pixel_id'                 => dcbd_trk_env('META_PIXEL_ID', ''),
        'meta_test_event_code'          => dcbd_trk_env('META_TEST_EVENT_CODE', ''),
        'tiktok_pixel_id'               => dcbd_trk_env('TIKTOK_PIXEL_ID', ''),
        'tiktok_test_event_code'        => dcbd_trk_env('TIKTOK_TEST_EVENT_CODE', ''),
        'clarity_project_id'            => dcbd_trk_env('CLARITY_PROJECT_ID', ''),

        // Consent & Privacy Settings (Banner disabled by default to preserve 100% existing storefront design)
        'consent_banner_enabled'        => false,
        'consent_default_analytics'     => 'granted',
        'consent_default_marketing'     => 'granted',
        'consent_require_explicit_eea'  => true,
        'consent_respect_gpc_dnt'       => true,
        'consent_policy_version'        => '1.0',
        'consent_banner_position'       => 'bottom',
        'consent_banner_text_bn'        => 'আমরা সাইটের অভিজ্ঞতা ও বিজ্ঞাপন উন্নত করতে কুকি ও অ্যানালিটিক্স ব্যবহার করি। আপনি আপনার পছন্দ পরিবর্তন করতে পারবেন।',
    ];
}

/**
 * List of secret keys stored ONLY in encrypted server-side table (never returned to browser or unmasked in UI)
 */
function dcbd_trk_secret_keys(): array {
    return [
        'meta_capi_access_token'   => 'META_CAPI_ACCESS_TOKEN',
        'ga4_api_secret'           => 'GA4_API_SECRET',
        'tiktok_events_api_token'  => 'TIKTOK_EVENTS_API_ACCESS_TOKEN',
        'google_ads_api_token'     => 'GOOGLE_ADS_API_TOKEN',
        'pinterest_api_token'      => 'PINTEREST_API_TOKEN',
        'snapchat_api_token'       => 'SNAPCHAT_API_TOKEN',
    ];
}
