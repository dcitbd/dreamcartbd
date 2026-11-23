<?php
/**
 * Dream Cart BD — Public Non-Secret Browser Tracking Config (tracking/api/config.php)
 * Returns ONLY public pixel/measurement IDs and consent defaults.
 * NEVER exposes API tokens, secrets, private keys, or internal database paths.
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=60');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, dcbd_trk_allowed_origins(), true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

try {
    $s = DcbdTrackingDb::getSettings();
    $public = [
        'version'       => DCBD_TRK_VERSION,
        'schemaVersion' => DCBD_TRK_SCHEMA_VERSION,
        'masterEnabled' => !empty($s['master_enabled']),
        'testMode'      => !empty($s['test_mode']),
        'currency'      => 'BDT',
        'platforms'     => [
            'gtm' => [
                'enabled'     => !empty($s['gtm_enabled']) && !empty($s['gtm_container_id']),
                'containerId' => (string)($s['gtm_container_id'] ?? ''),
            ],
            'ga4' => [
                'enabled'       => !empty($s['ga4_enabled']) && !empty($s['ga4_measurement_id']),
                'measurementId' => (string)($s['ga4_measurement_id'] ?? ''),
            ],
            'googleAds' => [
                'enabled'             => !empty($s['google_ads_enabled']) && !empty($s['google_ads_conversion_id']),
                'conversionId'        => (string)($s['google_ads_conversion_id'] ?? ''),
                'conversionLabel'     => (string)($s['google_ads_conversion_label'] ?? ''),
                'enhancedConversions' => !empty($s['google_ads_ec_enabled']),
            ],
            'meta' => [
                'enabled' => !empty($s['meta_pixel_enabled']) && !empty($s['meta_pixel_id']),
                'pixelId' => (string)($s['meta_pixel_id'] ?? ''),
            ],
            'tiktok' => [
                'enabled' => !empty($s['tiktok_pixel_enabled']) && !empty($s['tiktok_pixel_id']),
                'pixelId' => (string)($s['tiktok_pixel_id'] ?? ''),
            ],
            'clarity' => [
                'enabled'   => !empty($s['clarity_enabled']) && !empty($s['clarity_project_id']),
                'projectId' => (string)($s['clarity_project_id'] ?? ''),
            ],
        ],
        'consent'       => [
            'bannerEnabled'    => !empty($s['consent_banner_enabled']),
            'defaultAnalytics' => (string)($s['consent_default_analytics'] ?? 'granted'),
            'defaultMarketing' => (string)($s['consent_default_marketing'] ?? 'granted'),
            'respectGpcDnt'    => !empty($s['consent_respect_gpc_dnt']),
            'policyVersion'    => (string)($s['consent_policy_version'] ?? '1.0'),
            'bannerPosition'   => (string)($s['consent_banner_position'] ?? 'bottom'),
            'bannerTextBn'     => (string)($s['consent_banner_text_bn'] ?? ''),
        ],
    ];
    echo json_encode(['ok' => true, 'config' => $public], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Configuration unavailable']);
}
