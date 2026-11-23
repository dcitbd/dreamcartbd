<?php
/**
 * Dream Cart BD — Consent Management & Server-Side Enforcement (tracking/consent.php)
 */

declare(strict_types=1);

require_once __DIR__ . '/db.php';

class DcbdTrackingConsent {
    public static function record(array $input): array {
        $pdo = DcbdTrackingDb::pdo();
        $settings = DcbdTrackingDb::getSettings();

        $rawSession = trim((string)($input['session_id'] ?? ''));
        if ($rawSession === '') {
            $rawSession = dcbd_trk_client_ip() . '|' . ($_SERVER['HTTP_USER_AGENT'] ?? '');
        }
        $sessionHash = hash('sha256', 'dcbd_consent::' . $rawSession);

        $gpc = !empty($input['gpc']) || (isset($_SERVER['HTTP_SEC_GPC']) && $_SERVER['HTTP_SEC_GPC'] === '1');
        $analytics = !empty($input['analytics']);
        $marketing = !empty($input['marketing']);

        if ($gpc && !empty($settings['consent_respect_gpc_dnt'])) {
            $marketing = false;
        }

        $source = in_array((string)($input['source'] ?? 'banner'), ['banner', 'preferences', 'default', 'gpc'], true)
            ? (string)$input['source']
            : 'banner';

        $now = date('c');
        $stmt = $pdo->prepare('INSERT INTO dcbd_trk_consent (session_hash, necessary, analytics, marketing, gpc_signal, policy_version, source, created_at) VALUES (:sh, 1, :an, :mk, :gpc, :pv, :src, :dt)');
        $stmt->execute([
            ':sh'  => $sessionHash,
            ':an'  => $analytics ? 1 : 0,
            ':mk'  => $marketing ? 1 : 0,
            ':gpc' => $gpc ? 1 : 0,
            ':pv'  => (string)($settings['consent_policy_version'] ?? '1.0'),
            ':src' => $source,
            ':dt'  => $now,
        ]);

        return [
            'necessary'      => true,
            'analytics'      => $analytics,
            'marketing'      => $marketing,
            'gpc'            => $gpc,
            'policy_version' => (string)($settings['consent_policy_version'] ?? '1.0'),
            'timestamp'      => $now,
        ];
    }

    /**
     * Check whether a provider category ('analytics' or 'marketing') is permitted for an event
     */
    public static function isPermitted(array $consentState, string $category, array $settings): bool {
        if ($category === 'necessary') return true;
        if (!empty($consentState['gpc']) && !empty($settings['consent_respect_gpc_dnt']) && $category === 'marketing') {
            return false;
        }
        if ($category === 'analytics') {
            return !empty($consentState['analytics']);
        }
        if ($category === 'marketing') {
            return !empty($consentState['marketing']);
        }
        return false;
    }
}
