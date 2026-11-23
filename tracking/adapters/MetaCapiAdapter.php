<?php
/**
 * Dream Cart BD — Meta Conversions API (CAPI) Adapter (tracking/adapters/MetaCapiAdapter.php)
 * Official Docs (verified 2026-11-24):
 * - https://developers.facebook.com/documentation/ads-commerce/conversions-api
 * - https://developers.facebook.com/documentation/development/graph-api/changelog (Latest: v27.0)
 */

declare(strict_types=1);

require_once __DIR__ . '/AdapterInterface.php';
require_once dirname(__DIR__) . '/db.php';

class MetaCapiAdapter implements DcbdTrackingAdapterInterface {
    public const GRAPH_API_VERSION = 'v27.0';

    private const EVENT_MAP = [
        'page_view'         => 'PageView',
        'view_item'         => 'ViewContent',
        'search'            => 'Search',
        'add_to_cart'       => 'AddToCart',
        'begin_checkout'    => 'InitiateCheckout',
        'add_payment_info'  => 'AddPaymentInfo',
        'sign_up'           => 'CompleteRegistration',
        'generate_lead'     => 'Lead',
        'contact'           => 'Contact',
        'purchase'          => 'Purchase',
    ];

    public function getName(): string { return 'meta_capi'; }
    public function getDisplayName(): string { return 'Meta Conversions API (v27.0)'; }
    public function getConsentCategory(): string { return 'marketing'; }
    public function supportsTestEvent(): bool { return true; }

    public function isEnabled(array $settings): bool {
        return !empty($settings['meta_capi_enabled']) && $this->isConfigured($settings);
    }

    public function isConfigured(array $settings): bool {
        $pixelId = trim((string)($settings['meta_pixel_id'] ?? ''));
        $token = DcbdTrackingDb::getSecret('meta_capi_access_token');
        return $pixelId !== '' && $token !== '';
    }

    public function mapEvent(array $canonicalEvent, array $settings): ?array {
        $evName = (string)($canonicalEvent['event_name'] ?? '');
        if (!isset(self::EVENT_MAP[$evName])) {
            return null;
        }

        $userCtx = $canonicalEvent['user_context'] ?? [];
        $attr = $canonicalEvent['attribution'] ?? [];
        $userData = [
            'client_ip_address' => (string)($userCtx['client_ip_address'] ?? ''),
            'client_user_agent' => (string)($userCtx['client_user_agent'] ?? ''),
            'country'           => [(string)($userCtx['country_hash'] ?? hash('sha256', 'bd'))],
        ];
        if (!empty($userCtx['em_hash'])) $userData['em'] = [$userCtx['em_hash']];
        if (!empty($userCtx['ph_hash'])) $userData['ph'] = [$userCtx['ph_hash']];
        if (!empty($userCtx['fn_hash'])) $userData['fn'] = [$userCtx['fn_hash']];
        if (!empty($userCtx['ct_hash'])) $userData['ct'] = [$userCtx['ct_hash']];
        if (!empty($attr['fbc'])) $userData['fbc'] = $attr['fbc'];
        if (!empty($attr['fbp'])) $userData['fbp'] = $attr['fbp'];

        $items = $canonicalEvent['items'] ?? [];
        $contentIds = [];
        $contents = [];
        foreach ($items as $it) {
            $id = (string)($it['item_id'] ?? '');
            if ($id === '') continue;
            $contentIds[] = $id;
            $contents[] = [
                'id'         => $id,
                'quantity'   => (int)($it['quantity'] ?? 1),
                'item_price' => (float)($it['price'] ?? 0),
            ];
        }

        $customData = [
            'currency' => (string)($canonicalEvent['currency'] ?? 'BDT'),
        ];
        if ((float)($canonicalEvent['value'] ?? 0) > 0 || $evName === 'purchase') {
            $customData['value'] = (float)($canonicalEvent['value'] ?? 0);
        }
        if (!empty($contentIds)) {
            $customData['content_ids'] = $contentIds;
            $customData['content_type'] = 'product';
            $customData['contents'] = $contents;
            $customData['num_items'] = array_sum(array_column($contents, 'quantity'));
        }
        if (!empty($canonicalEvent['order_id'])) {
            $customData['order_id'] = (string)$canonicalEvent['order_id'];
        }
        if (!empty($canonicalEvent['extra']['search_term'])) {
            $customData['search_string'] = (string)$canonicalEvent['extra']['search_term'];
        }
        if (!empty($canonicalEvent['payment_state'])) {
            $customData['payment_state'] = (string)$canonicalEvent['payment_state'];
        }

        $eventObj = [
            'event_name'       => self::EVENT_MAP[$evName],
            'event_time'       => (int)($canonicalEvent['event_time'] ?? time()),
            'event_id'         => (string)($canonicalEvent['event_id'] ?? ''),
            'action_source'    => 'website',
            'event_source_url' => (string)($canonicalEvent['event_source_url'] ?? 'https://dreamcartbd.com/'),
            'user_data'        => $userData,
            'custom_data'      => $customData,
        ];

        $body = ['data' => [$eventObj]];
        $testCode = trim((string)($settings['meta_test_event_code'] ?? ''));
        if ($testCode !== '' && (!empty($canonicalEvent['is_test']) || !empty($settings['test_mode']))) {
            $body['test_event_code'] = $testCode;
        }
        return $body;
    }

    public function send(array $canonicalEvent, array $settings, bool $testMode = false): array {
        if (!$this->isConfigured($settings)) {
            return ['ok' => false, 'retryable' => false, 'http_code' => 0, 'latency_ms' => 0, 'summary' => '', 'error' => 'Meta CAPI credentials not configured'];
        }

        if ($testMode) {
            $canonicalEvent['is_test'] = 1;
        }
        $payload = $this->mapEvent($canonicalEvent, $settings);
        if ($payload === null) {
            return ['ok' => true, 'retryable' => false, 'http_code' => 204, 'latency_ms' => 0, 'summary' => 'Event not mapped for Meta CAPI (skipped)', 'error' => ''];
        }

        $pixelId = preg_replace('/[^0-9]/', '', (string)($settings['meta_pixel_id'] ?? ''));
        $token = DcbdTrackingDb::getSecret('meta_capi_access_token');
        // Pass token via Authorization Bearer header (never in query string logs)
        $url = 'https://graph.facebook.com/' . self::GRAPH_API_VERSION . '/' . rawurlencode($pixelId) . '/events';
        return DcbdTrackingHttp::postJson($url, $payload, [
            'Authorization: Bearer ' . $token,
        ]);
    }
}
