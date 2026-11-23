<?php
/**
 * Dream Cart BD — Canonical Event Schema v1.0.0 & Strict Validator (tracking/schema.php)
 * Validates, normalizes, and hashes permitted PII fields according to Meta, Google, and TikTok specs.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

class DcbdTrackingSchema {
    public const ALLOWED_EVENTS = [
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
        'contact',
        'purchase',
        'refund',
    ];

    // Events that may ONLY originate from authoritative server-side order state (never trusted from browser)
    public const SERVER_ONLY_EVENTS = ['purchase', 'refund'];

    public static function generateEventId(string $eventName, string $orderId = ''): string {
        if ($eventName === 'purchase' && $orderId !== '') {
            return 'PUR_' . preg_replace('/[^A-Za-z0-9_\-]/', '', $orderId);
        }
        if ($eventName === 'refund' && $orderId !== '') {
            return 'REF_' . preg_replace('/[^A-Za-z0-9_\-]/', '', $orderId);
        }
        return 'DCBD_' . strtoupper(substr($eventName, 0, 8)) . '_' . time() . '_' . bin2hex(random_bytes(5));
    }

    /**
     * Validate and normalize an incoming event payload into the canonical v1.0.0 structure.
     * Returns ['valid' => true, 'event' => array] or ['valid' => false, 'error' => string].
     */
    public static function normalize(array $raw, string $sourceOrigin = 'browser'): array {
        $eventName = strtolower(trim((string)($raw['event_name'] ?? '')));
        if (!in_array($eventName, self::ALLOWED_EVENTS, true)) {
            return ['valid' => false, 'error' => 'Unsupported event_name'];
        }

        // Security & Order Integrity: reject browser-submitted purchase/refund events
        if ($sourceOrigin === 'browser' && in_array($eventName, self::SERVER_ONLY_EVENTS, true)) {
            return ['valid' => false, 'error' => 'Purchase and refund events are authoritative server-side only'];
        }

        $orderId = substr(preg_replace('/[^A-Za-z0-9_\-]/', '', trim((string)($raw['order_id'] ?? ''))), 0, 64);
        $eventId = trim((string)($raw['event_id'] ?? ''));
        if ($eventId === '' || !preg_match('/^[A-Za-z0-9_\-]{6,96}$/', $eventId)) {
            $eventId = self::generateEventId($eventName, $orderId);
        }

        $eventTime = isset($raw['event_time']) && is_numeric($raw['event_time'])
            ? (int)$raw['event_time']
            : time();
        // Clamp event_time within reasonable window (max 7 days past, max 5 min future)
        $now = time();
        if ($eventTime < ($now - 86400 * 7) || $eventTime > ($now + 300)) {
            $eventTime = $now;
        }

        $sourceUrl = trim((string)($raw['event_source_url'] ?? ''));
        if ($sourceUrl !== '' && !preg_match('#^https?://#i', $sourceUrl)) {
            $sourceUrl = '';
        }
        $sourceUrl = substr($sourceUrl, 0, 1024);

        $currency = strtoupper(preg_replace('/[^A-Z]/', '', (string)($raw['currency'] ?? 'BDT')));
        if (strlen($currency) !== 3) {
            $currency = 'BDT';
        }

        $value = isset($raw['value']) && is_numeric($raw['value']) ? max(0.0, round((float)$raw['value'], 2)) : 0.0;

        // Normalize product items
        $items = [];
        if (isset($raw['items']) && is_array($raw['items'])) {
            foreach (array_slice($raw['items'], 0, 50) as $it) {
                if (!is_array($it)) continue;
                $itemId = substr(trim((string)($it['item_id'] ?? $it['sku'] ?? $it['id'] ?? '')), 0, 80);
                $itemName = substr(trim((string)($it['item_name'] ?? $it['name'] ?? '')), 0, 180);
                if ($itemId === '' && $itemName === '') continue;
                $items[] = [
                    'item_id'       => $itemId !== '' ? $itemId : substr(md5($itemName), 0, 12),
                    'item_name'     => $itemName,
                    'price'         => isset($it['price']) && is_numeric($it['price']) ? max(0.0, round((float)$it['price'], 2)) : 0.0,
                    'quantity'      => isset($it['quantity']) && is_numeric($it['quantity']) ? max(1, min(9999, (int)$it['quantity'])) : 1,
                    'item_category' => substr(trim((string)($it['item_category'] ?? $it['category'] ?? '')), 0, 100),
                    'item_brand'    => substr(trim((string)($it['item_brand'] ?? $it['brand'] ?? '')), 0, 80),
                ];
            }
        }

        // Consent state
        $rawConsent = is_array($raw['consent_state'] ?? null) ? $raw['consent_state'] : [];
        $consentState = [
            'necessary' => true,
            'analytics' => !empty($rawConsent['analytics']),
            'marketing' => !empty($rawConsent['marketing']),
            'gpc'       => !empty($rawConsent['gpc']),
            'timestamp' => (string)($rawConsent['timestamp'] ?? date('c')),
        ];

        // Permitted attribution identifiers (strictly sanitized, no arbitrary URLs)
        $rawAttr = is_array($raw['attribution'] ?? null) ? $raw['attribution'] : [];
        $attribution = [];
        foreach (['fbclid', 'fbc', 'fbp', 'gclid', 'wbraid', 'gbraid', 'ttclid', 'ttp', 'ga_client_id', 'ga_session_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as $ak) {
            if (!empty($rawAttr[$ak]) && is_scalar($rawAttr[$ak])) {
                $attribution[$ak] = substr(preg_replace('/[^A-Za-z0-9_\-\.\:]/', '', (string)$rawAttr[$ak]), 0, 200);
            }
        }

        // Permitted user matching data — IMMEDIATELY normalized & SHA-256 hashed so raw PII is never stored in event logs
        $rawUser = is_array($raw['user_data'] ?? null) ? $raw['user_data'] : [];
        $userContext = [
            'client_ip_address' => dcbd_trk_client_ip(),
            'client_user_agent' => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ($rawUser['user_agent'] ?? '')), 0, 300),
            'country_hash'      => hash('sha256', 'bd'),
        ];

        // Only collect/hash PII when marketing consent is granted
        if ($consentState['marketing']) {
            $emailHash = self::normalizeAndHashEmail((string)($rawUser['email'] ?? ''));
            if ($emailHash !== '') $userContext['em_hash'] = $emailHash;

            $phoneHash = self::normalizeAndHashPhone((string)($rawUser['phone'] ?? ''));
            if ($phoneHash !== '') $userContext['ph_hash'] = $phoneHash;

            $fnHash = self::normalizeAndHashName((string)($rawUser['first_name'] ?? $rawUser['name'] ?? ''));
            if ($fnHash !== '') $userContext['fn_hash'] = $fnHash;

            $cityHash = self::normalizeAndHashName((string)($rawUser['city'] ?? ''));
            if ($cityHash !== '') $userContext['ct_hash'] = $cityHash;
        }

        // Safe extra metadata (search_term, shipping, discount, payment_method, etc. — never passwords/cards)
        $extra = [];
        if ($eventName === 'search' && isset($raw['search_term'])) {
            $term = trim((string)$raw['search_term']);
            // Never leak emails, phone numbers, or card-like numbers in search events
            if (!preg_match('/@|\b\d{11,16}\b/', $term)) {
                $extra['search_term'] = substr($term, 0, 120);
            }
        }
        foreach (['shipping', 'discount', 'tax'] as $numKey) {
            if (isset($raw[$numKey]) && is_numeric($raw[$numKey])) {
                $extra[$numKey] = max(0.0, round((float)$raw[$numKey], 2));
            }
        }
        foreach (['payment_type', 'shipping_tier', 'coupon', 'method', 'item_list_name', 'page_title'] as $strKey) {
            if (!empty($raw[$strKey]) && is_scalar($raw[$strKey])) {
                $extra[$strKey] = substr(trim((string)$raw[$strKey]), 0, 120);
            }
        }

        return [
            'valid' => true,
            'event' => [
                'schema_version'   => DCBD_TRK_SCHEMA_VERSION,
                'event_id'         => $eventId,
                'event_name'       => $eventName,
                'event_time'       => $eventTime,
                'event_source_url' => $sourceUrl,
                'action_source'    => 'website',
                'currency'         => $currency,
                'value'            => $value,
                'order_id'         => $orderId,
                'payment_state'    => substr(trim((string)($raw['payment_state'] ?? '')), 0, 40),
                'items'            => $items,
                'consent_state'    => $consentState,
                'attribution'      => $attribution,
                'user_context'     => $userContext,
                'extra'            => $extra,
                'is_test'          => !empty($raw['is_test']) ? 1 : 0,
                'source_origin'    => $sourceOrigin,
            ],
        ];
    }

    public static function normalizeAndHashEmail(string $email): string {
        $clean = strtolower(trim($email));
        if ($clean === '' || !filter_var($clean, FILTER_VALIDATE_EMAIL)) return '';
        return hash('sha256', $clean);
    }

    public static function normalizeAndHashPhone(string $phone): string {
        $digits = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($digits) === 11 && str_starts_with($digits, '01')) {
            $digits = '88' . $digits; // Bangladesh E.164 digits without '+'
        }
        if (strlen($digits) < 10 || strlen($digits) > 15) return '';
        return hash('sha256', $digits);
    }

    public static function normalizeAndHashName(string $name): string {
        $clean = strtolower(trim(preg_replace('/\s+/', ' ', $name)));
        if ($clean === '') return '';
        return hash('sha256', $clean);
    }
}
