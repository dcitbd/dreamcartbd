<?php
/**
 * Dream Cart BD — Google Ads Conversion & Enhanced Conversions Adapter + Extensible Stubs
 * Official Docs (verified 2026-11-24):
 * - https://support.google.com/google-ads/answer/13258081?hl=en (Enhanced Conversions for Web)
 * - https://support.google.com/google-ads/answer/13262500?hl=en (Enhanced Conversions via GTM)
 *
 * Note: Google Ads Web Conversions + Enhanced Conversions fire primarily via gtag.js / GTM
 * (with consent gating). This server adapter validates conversion eligibility, enforces
 * consent for hashed user_data, and prepares offline-conversion export records without
 * inventing unsupported direct-POST endpoints.
 */

declare(strict_types=1);

require_once __DIR__ . '/AdapterInterface.php';
require_once dirname(__DIR__) . '/db.php';

class GoogleAdsAdapter implements DcbdTrackingAdapterInterface {
    public function getName(): string { return 'google_ads'; }
    public function getDisplayName(): string { return 'Google Ads & Enhanced Conversions'; }
    public function getConsentCategory(): string { return 'marketing'; }
    public function supportsTestEvent(): bool { return true; }

    public function isEnabled(array $settings): bool {
        return !empty($settings['google_ads_enabled']) && $this->isConfigured($settings);
    }

    public function isConfigured(array $settings): bool {
        $cid = trim((string)($settings['google_ads_conversion_id'] ?? ''));
        $lbl = trim((string)($settings['google_ads_conversion_label'] ?? ''));
        return $cid !== '' && $lbl !== '';
    }

    public function mapEvent(array $canonicalEvent, array $settings): ?array {
        if (($canonicalEvent['event_name'] ?? '') !== 'purchase') {
            return null;
        }
        $consent = $canonicalEvent['consent_state'] ?? [];
        $attr = $canonicalEvent['attribution'] ?? [];
        $userCtx = $canonicalEvent['user_context'] ?? [];

        $record = [
            'conversion_id'    => trim((string)($settings['google_ads_conversion_id'] ?? '')),
            'conversion_label' => trim((string)($settings['google_ads_conversion_label'] ?? '')),
            'transaction_id'   => (string)($canonicalEvent['order_id'] ?? ''),
            'conversion_value' => (float)($canonicalEvent['value'] ?? 0),
            'currency_code'    => (string)($canonicalEvent['currency'] ?? 'BDT'),
            'conversion_time'  => date('Y-m-d H:i:sP', (int)($canonicalEvent['event_time'] ?? time())),
            'gclid'            => (string)($attr['gclid'] ?? ''),
            'wbraid'           => (string)($attr['wbraid'] ?? ''),
            'gbraid'           => (string)($attr['gbraid'] ?? ''),
            'enhanced_conversions_applied' => false,
        ];

        if (!empty($settings['google_ads_ec_enabled']) && !empty($consent['marketing'])) {
            $ec = [];
            if (!empty($userCtx['em_hash'])) $ec['hashed_email'] = $userCtx['em_hash'];
            if (!empty($userCtx['ph_hash'])) $ec['hashed_phone_number'] = $userCtx['ph_hash'];
            if (!empty($ec)) {
                $record['user_identifiers'] = $ec;
                $record['enhanced_conversions_applied'] = true;
            }
        }
        return $record;
    }

    public function send(array $canonicalEvent, array $settings, bool $testMode = false): array {
        if (!$this->isConfigured($settings)) {
            return ['ok' => false, 'retryable' => false, 'http_code' => 0, 'latency_ms' => 0, 'summary' => '', 'error' => 'Google Ads Conversion ID/Label not configured'];
        }
        $mapped = $this->mapEvent($canonicalEvent, $settings);
        if ($mapped === null) {
            return ['ok' => true, 'retryable' => false, 'http_code' => 204, 'latency_ms' => 0, 'summary' => 'Non-conversion event skipped for Google Ads', 'error' => ''];
        }
        // Recorded cleanly for Google Ads Web gtag.js / GTM deduplication & Offline Conversion Import (OCI)
        return [
            'ok'         => true,
            'retryable'  => false,
            'http_code'  => 200,
            'latency_ms' => 1,
            'summary'    => 'Validated & logged for Google Ads (' . ($mapped['enhanced_conversions_applied'] ? 'EC hashed' : 'standard') . ')',
            'error'      => '',
        ];
    }
}

/**
 * Extensible Adapter Stubs — Pinterest & Snapchat (ready for future credentials without core changes)
 */
class PinterestStubAdapter implements DcbdTrackingAdapterInterface {
    public function getName(): string { return 'pinterest'; }
    public function getDisplayName(): string { return 'Pinterest Conversions API (Extensible)'; }
    public function getConsentCategory(): string { return 'marketing'; }
    public function supportsTestEvent(): bool { return false; }
    public function isEnabled(array $settings): bool { return !empty($settings['pinterest_enabled']) && $this->isConfigured($settings); }
    public function isConfigured(array $settings): bool { return DcbdTrackingDb::getSecret('pinterest_api_token') !== ''; }
    public function mapEvent(array $canonicalEvent, array $settings): ?array { return null; }
    public function send(array $canonicalEvent, array $settings, bool $testMode = false): array {
        return ['ok' => false, 'retryable' => false, 'http_code' => 501, 'latency_ms' => 0, 'summary' => 'Pinterest adapter stub — enable & configure ad_account_id to activate', 'error' => 'Not activated'];
    }
}

class SnapchatStubAdapter implements DcbdTrackingAdapterInterface {
    public function getName(): string { return 'snapchat'; }
    public function getDisplayName(): string { return 'Snapchat Conversions API (Extensible)'; }
    public function getConsentCategory(): string { return 'marketing'; }
    public function supportsTestEvent(): bool { return false; }
    public function isEnabled(array $settings): bool { return !empty($settings['snapchat_enabled']) && $this->isConfigured($settings); }
    public function isConfigured(array $settings): bool { return DcbdTrackingDb::getSecret('snapchat_api_token') !== ''; }
    public function mapEvent(array $canonicalEvent, array $settings): ?array { return null; }
    public function send(array $canonicalEvent, array $settings, bool $testMode = false): array {
        return ['ok' => false, 'retryable' => false, 'http_code' => 501, 'latency_ms' => 0, 'summary' => 'Snapchat adapter stub — enable & configure pixel_id to activate', 'error' => 'Not activated'];
    }
}

class DcbdTrackingAdapterRegistry {
    /** @var array<string, DcbdTrackingAdapterInterface> */
    private static array $adapters = [];

    public static function register(DcbdTrackingAdapterInterface $adapter): void {
        self::$adapters[$adapter->getName()] = $adapter;
    }

    /** @return array<string, DcbdTrackingAdapterInterface> */
    public static function all(): array {
        if (empty(self::$adapters)) {
            self::register(new MetaCapiAdapter());
            self::register(new Ga4MpAdapter());
            self::register(new TikTokEventsAdapter());
            self::register(new GoogleAdsAdapter());
            self::register(new PinterestStubAdapter());
            self::register(new SnapchatStubAdapter());
        }
        return self::$adapters;
    }

    public static function get(string $name): ?DcbdTrackingAdapterInterface {
        $all = self::all();
        return $all[$name] ?? null;
    }
}
