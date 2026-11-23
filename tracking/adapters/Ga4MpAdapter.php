<?php
/**
 * Dream Cart BD — Google Analytics 4 Measurement Protocol Adapter (tracking/adapters/Ga4MpAdapter.php)
 * Official Docs (verified 2026-11-24):
 * - https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference
 * - https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events
 */

declare(strict_types=1);

require_once __DIR__ . '/AdapterInterface.php';
require_once dirname(__DIR__) . '/db.php';

class Ga4MpAdapter implements DcbdTrackingAdapterInterface {
    private const SUPPORTED_EVENTS = [
        'page_view',
        'view_item_list',
        'select_item',
        'view_item',
        'search',
        'add_to_cart',
        'remove_from_cart',
        'view_cart',
        'begin_checkout',
        'add_shipping_info',
        'add_payment_info',
        'sign_up',
        'login',
        'generate_lead',
        'purchase',
        'refund',
    ];

    public function getName(): string { return 'ga4_mp'; }
    public function getDisplayName(): string { return 'GA4 Measurement Protocol'; }
    public function getConsentCategory(): string { return 'analytics'; }
    public function supportsTestEvent(): bool { return true; }

    public function isEnabled(array $settings): bool {
        return !empty($settings['ga4_mp_enabled']) && $this->isConfigured($settings);
    }

    public function isConfigured(array $settings): bool {
        $mid = trim((string)($settings['ga4_measurement_id'] ?? ''));
        $secret = DcbdTrackingDb::getSecret('ga4_api_secret');
        return $mid !== '' && $secret !== '';
    }

    public function mapEvent(array $canonicalEvent, array $settings): ?array {
        $evName = (string)($canonicalEvent['event_name'] ?? '');
        if (!in_array($evName, self::SUPPORTED_EVENTS, true)) {
            return null;
        }

        $attr = $canonicalEvent['attribution'] ?? [];
        $clientId = trim((string)($attr['ga_client_id'] ?? ''));
        if ($clientId === '') {
            // Deterministic fallback client_id per order/event if browser _ga cookie unavailable
            $seed = (string)($canonicalEvent['order_id'] ?: $canonicalEvent['event_id']);
            $clientId = sprintf('%u.%u', crc32($seed), (int)($canonicalEvent['event_time'] ?? time()));
        }

        $params = [
            'engagement_time_msec' => 100,
            'event_id'             => (string)($canonicalEvent['event_id'] ?? ''),
        ];
        if (!empty($canonicalEvent['event_source_url'])) {
            $params['page_location'] = (string)$canonicalEvent['event_source_url'];
        }
        if (!empty($attr['ga_session_id']) && is_numeric($attr['ga_session_id'])) {
            $params['session_id'] = (int)$attr['ga_session_id'];
        }
        if (!empty($canonicalEvent['currency'])) {
            $params['currency'] = (string)$canonicalEvent['currency'];
        }
        if ((float)($canonicalEvent['value'] ?? 0) > 0 || $evName === 'purchase') {
            $params['value'] = (float)($canonicalEvent['value'] ?? 0);
        }
        if (!empty($canonicalEvent['order_id'])) {
            $params['transaction_id'] = (string)$canonicalEvent['order_id'];
        }
        if (!empty($canonicalEvent['payment_state'])) {
            $params['payment_state'] = (string)$canonicalEvent['payment_state'];
        }

        $extra = $canonicalEvent['extra'] ?? [];
        foreach (['search_term', 'shipping', 'discount', 'tax', 'payment_type', 'shipping_tier', 'coupon', 'method', 'item_list_name', 'page_title'] as $ek) {
            if (isset($extra[$ek]) && $extra[$ek] !== '') {
                $params[$ek] = $extra[$ek];
            }
        }

        if (!empty($canonicalEvent['items']) && is_array($canonicalEvent['items'])) {
            $params['items'] = array_map(static function (array $it): array {
                $row = [
                    'item_id'   => (string)($it['item_id'] ?? ''),
                    'item_name' => (string)($it['item_name'] ?? ''),
                    'price'     => (float)($it['price'] ?? 0),
                    'quantity'  => (int)($it['quantity'] ?? 1),
                ];
                if (!empty($it['item_category'])) $row['item_category'] = (string)$it['item_category'];
                if (!empty($it['item_brand'])) $row['item_brand'] = (string)$it['item_brand'];
                return $row;
            }, $canonicalEvent['items']);
        }

        if (!empty($canonicalEvent['is_test']) || !empty($settings['test_mode'])) {
            $params['debug_mode'] = 1;
        }

        $consent = $canonicalEvent['consent_state'] ?? [];
        return [
            'client_id'        => $clientId,
            'timestamp_micros' => (string)(((int)($canonicalEvent['event_time'] ?? time())) * 1000000),
            'consent'          => [
                'ad_user_data'       => !empty($consent['marketing']) ? 'GRANTED' : 'DENIED',
                'ad_personalization' => !empty($consent['marketing']) ? 'GRANTED' : 'DENIED',
            ],
            'events'           => [
                [
                    'name'   => $evName,
                    'params' => $params,
                ],
            ],
        ];
    }

    public function send(array $canonicalEvent, array $settings, bool $testMode = false): array {
        if (!$this->isConfigured($settings)) {
            return ['ok' => false, 'retryable' => false, 'http_code' => 0, 'latency_ms' => 0, 'summary' => '', 'error' => 'GA4 Measurement Protocol credentials not configured'];
        }
        if ($testMode) {
            $canonicalEvent['is_test'] = 1;
        }
        $payload = $this->mapEvent($canonicalEvent, $settings);
        if ($payload === null) {
            return ['ok' => true, 'retryable' => false, 'http_code' => 204, 'latency_ms' => 0, 'summary' => 'Event not mapped for GA4 MP (skipped)', 'error' => ''];
        }

        $mid = trim((string)($settings['ga4_measurement_id'] ?? ''));
        $secret = DcbdTrackingDb::getSecret('ga4_api_secret');
        // Official GA4 Measurement Protocol endpoint (uses /debug/mp/collect in test mode for schema validation)
        $path = ($testMode || !empty($settings['test_mode'])) ? '/debug/mp/collect' : '/mp/collect';
        $url = 'https://www.google-analytics.com' . $path
            . '?measurement_id=' . rawurlencode($mid)
            . '&api_secret=' . rawurlencode($secret);

        return DcbdTrackingHttp::postJson($url, $payload);
    }
}
