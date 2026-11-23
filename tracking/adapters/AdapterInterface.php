<?php
/**
 * Dream Cart BD — Modular Provider Adapter Interface & Safe HTTPS Client (tracking/adapters/AdapterInterface.php)
 * Enforces strict HTTPS allowlist (SSRF protection), timeouts, and retryable vs non-retryable classification.
 */

declare(strict_types=1);

interface DcbdTrackingAdapterInterface {
    public function getName(): string;
    public function getDisplayName(): string;
    public function getConsentCategory(): string; // 'analytics' | 'marketing'
    public function isEnabled(array $settings): bool;
    public function isConfigured(array $settings): bool;
    public function supportsTestEvent(): bool;
    public function mapEvent(array $canonicalEvent, array $settings): ?array;
    public function send(array $canonicalEvent, array $settings, bool $testMode = false): array;
}

class DcbdTrackingHttp {
    /**
     * Strict official provider host allowlist to prevent SSRF.
     * Browser input can NEVER supply or override provider URLs.
     */
    private const ALLOWED_HOSTS = [
        'graph.facebook.com',
        'www.google-analytics.com',
        'business-api.tiktok.com',
        'googleads.googleapis.com',
        'api.pinterest.com',
        'tr.snapchat.com',
    ];

    public static function postJson(string $url, array $payload, array $headers = [], int $timeoutSec = 6): array {
        $parsed = parse_url($url);
        if (!$parsed || ($parsed['scheme'] ?? '') !== 'https') {
            return [
                'ok'        => false,
                'retryable' => false,
                'http_code' => 0,
                'latency_ms'=> 0,
                'summary'   => '',
                'error'     => 'Blocked non-HTTPS provider URL',
            ];
        }
        $host = strtolower((string)($parsed['host'] ?? ''));
        if (!in_array($host, self::ALLOWED_HOSTS, true)) {
            return [
                'ok'        => false,
                'retryable' => false,
                'http_code' => 0,
                'latency_ms'=> 0,
                'summary'   => '',
                'error'     => 'Blocked unauthorized provider host: ' . $host,
            ];
        }

        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $defaultHeaders = ['Content-Type: application/json', 'Accept: application/json'];
        $allHeaders = array_merge($defaultHeaders, $headers);
        $start = microtime(true);
        $httpCode = 0;
        $respBody = '';
        $errMsg = '';

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $body,
                CURLOPT_HTTPHEADER     => $allHeaders,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => min(4, $timeoutSec),
                CURLOPT_TIMEOUT        => $timeoutSec,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_USERAGENT      => 'DreamCartBD-Tracking/' . DCBD_TRK_VERSION,
            ]);
            $res = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if ($res === false) {
                $errMsg = curl_error($ch) ?: 'cURL transport failure';
            } else {
                $respBody = (string)$res;
            }
            curl_close($ch);
        } else {
            $ctx = stream_context_create([
                'http' => [
                    'method'        => 'POST',
                    'header'        => implode("\r\n", $allHeaders),
                    'content'       => $body,
                    'timeout'       => $timeoutSec,
                    'ignore_errors' => true,
                ],
                'ssl' => [
                    'verify_peer'      => true,
                    'verify_peer_name' => true,
                ],
            ]);
            $res = @file_get_contents($url, false, $ctx);
            if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
                $httpCode = (int)$m[1];
            }
            if ($res === false) {
                $errMsg = 'HTTP stream transport failure';
            } else {
                $respBody = (string)$res;
            }
        }

        $latencyMs = (int)round((microtime(true) - $start) * 1000);
        // Sanitize response summary (strip any accidental token reflections & cap length)
        $safeSummary = substr(preg_replace('/EAA[A-Za-z0-9]+|access_token=[^&\s"]+/', '[REDACTED]', $respBody), 0, 400);

        $isOk = ($httpCode >= 200 && $httpCode < 300) && $errMsg === '';
        // Retryable: network errors (0), timeouts, rate limits (429), and 5xx server errors
        $isRetryable = !$isOk && ($httpCode === 0 || $httpCode === 408 || $httpCode === 429 || $httpCode >= 500);

        return [
            'ok'         => $isOk,
            'retryable'  => $isRetryable,
            'http_code'  => $httpCode,
            'latency_ms' => $latencyMs,
            'summary'    => $safeSummary,
            'error'      => $isOk ? '' : ($errMsg !== '' ? $errMsg : ('HTTP ' . $httpCode . ': ' . $safeSummary)),
        ];
    }
}
