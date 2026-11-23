<?php
/**
 * Dream Cart BD — TikTok Events API v1.3 Adapter (tracking/adapters/TikTokEventsAdapter.php)
 * Official Docs (verified 2026-11-24):
 * - https://business-api.tiktok.com/portal/docs/events-api-web/v1.3
 * - https://business-api.tiktok.com/portal/docs/event-deduplication/v1.3
 * Consolidated Endpoint: POST https://business-api.tiktok.com/open_api/v1.3/event/track/
 */

declare(strict_types=1);

require_once __DIR__ . '/AdapterInterface.php';
require_once dirname(__DIR__) . '/db.php';

class TikTokEventsAdapter implements DcbdTrackingAdapterInterface {
    public const API_VERSION = 'v1.3';

    private const EVENT_MAP = [
        'view_item'        => 'ViewContent',
        'search'           => 'Search',
        'add_to_cart'      => 'AddToCart',
        'begin_checkout'   => 'InitiateCheckout',
        'add_payment_info' => 'AddPaymentInfo',
        'sign_up'          => 'CompleteRegistration',
        'generate_lead'    => 'SubmitForm',
        'contact'          => 'Contact',
        'purchase'         => 'CompletePayment',
    ];

    public function getName(): string { return 'tiktok_events_api'; }
    public function getDisplayName(): string { return 'TikTok Events API (v1.3)'; }
    public function getConsentCategory(): string { return 'marketing'; }
    public function supportsTestEvent(): bool { return true; }

    public function isEnabled(array $settings): bool {
        return !empty($settings['tiktok_events_api_enabled']) && $this->isConfigured($settings);
    }

    public function isConfigured(array $settings): bool {
        $pixelId = trim((string)($settings['tiktok_pixel_id'] ?? ''));
        $token = DcbdTrackingDb::getSecret('tiktok_events_api_token');
        return $pixelId !== '' && $token !== '';
    }

    public function mapEvent(array $canonicalEvent, array $settings): ?array {
        $evName = (string)($canonicalEvent['event_name'] ?? '');
        if (!isset(self::EVENT_MAP[$evName])) {
            return null;
        }

        $userCtx = $canonicalEvent['user_context'] ?? [];
        $attr = $canonicalEvent['attribution'] ?? [];
        $user = [
            'ip'         => (string)($userCtx['client_ip_address'] ?? ''),
            'user_agent' => (string)($userCtx['client_user_agent'] ?? ''),
        ];
        if (!empty($userCtx['em_hash'])) $user['email'] = $userCtx['em_hash'];
        if (!empty($userCtx['ph_hash'])) $user['phone'] = $userCtx['ph_hash'];
        if (!empty($attr['ttclid'])) $user['ttclid'] = $attr['ttclid'];
        if (!empty($attr['ttp'])) $user['ttp'] = $attr['ttp'];

        $contents = [];
        foreach (($canonicalEvent['items'] ?? []) as $it) {
            $contents[] = [
                'content_id'       => (string)($it['item_id'] ?? ''),
                'content_name'     => (string)($it['item_name'] ?? ''),
                'content_category' => (string)($it['item_category'] ?? ''),
                'price'            => (float)($it['price'] ?? 0),
                'quantity'         => (int)($it['quantity'] ?? 1),
                'content_type'     => 'product',
            ];
        }

        $properties = [
            'currency' => (string)($canonicalEvent['currency'] ?? 'BDT'),
            'value'    => (float)($canonicalEvent['value'] ?? 0),
        ];
        if (!empty($contents)) {
            $properties['contents'] = $contents;
        }
        if (!empty($canonicalEvent['order_id'])) {
            $properties['order_id'] = (string)$canonicalEvent['order_id'];
        }
        if (!empty($canonicalEvent['extra']['search_term'])) {
            $properties['query'] = (string)$canonicalEvent['extra']['search_term'];
        }

        $eventObj = [
            'event'      => self::EVENT_MAP[$evName],
            'event_time' => (int)($canonicalEvent['event_time'] ?? time()),
            'event_id'   => (string)($canonicalEvent['event_id'] ?? ''),
            'user'       => $user,
            'page'       => [
                'url' => (string)($canonicalEvent['event_source_url'] ?? 'https://dreamcartbd.com/'),
            ],
            'properties' => $properties,
        ];

        $body = [
            'event_source'    => 'web',
            'event_source_id' => trim((string)($settings['tiktok_pixel_id'] ?? '')),
            'data'            => [$eventObj],
        ];

        $testCode = trim((string)($settings['tiktok_test_event_code'] ?? ''));
        if ($testCode !== '' && (!empty($canonicalEvent['is_test']) || !empty($settings['test_mode']))) {
            $body['test_event_code'] = $testCode;
        }

        return $body;
    }

    public function send(array $canonicalEvent, array $settings, bool $testMode = false): array {
        if (!$this->isConfigured($settings)) {
            return ['ok' => false, 'retryable' => false, 'http_code' => 0, 'latency_ms' => 0, 'summary' => '', 'error' => 'TikTok Events API credentials not configured'];
        }
        if ($testMode) {
            $canonicalEvent['is_test'] = 1;
        }
        $payload = $this->mapEvent($canonicalEvent, $settings);
        if ($payload === null) {
            return ['ok' => true, 'retryable' => false, 'http_code' => 204, 'latency_ms' => 0, 'summary' => 'Event not mapped for TikTok Events API (skipped)', 'error' => ''];
        }

        $token = DcbdTrackingDb::getSecret('tiktok_events_api_token');
        $url = 'https://business-api.tiktok.com/open_api/' . self::API_VERSION . '/event/track/';
        return DcbdTrackingHttp::postJson($url, $payload, [
            'Access-Token: ' . $token,
        ]);
    }
}
