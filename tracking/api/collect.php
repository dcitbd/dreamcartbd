<?php
/**
 * Dream Cart BD — First-Party Event & Consent Collector Endpoint (tracking/api/collect.php)
 * Security controls:
 * - Strict POST-only, Origin allowlist, 32 KB payload cap, per-IP rate limiting (120 req / 60s)
 * - Rejects browser-spoofed purchase/refund events
 * - Non-blocking: persists & enqueues in <5ms; never waits on external ad APIs
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = dcbd_trk_allowed_origins();
if ($origin !== '') {
    if (!in_array($origin, $allowedOrigins, true)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Origin not allowed']);
        exit;
    }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Vary: Origin');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Payload size limit: 32 KB max
$rawBody = (string)@file_get_contents('php://input', false, null, 0, 32769);
if (strlen($rawBody) === 0 || strlen($rawBody) > 32768) {
    http_response_code(413);
    echo json_encode(['ok' => false, 'error' => 'Invalid or oversized payload']);
    exit;
}

$data = @json_decode($rawBody, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Malformed JSON payload']);
    exit;
}

try {
    // Per-IP rate limit: 120 events per 60 seconds
    $ipBucket = 'collect:' . hash('sha256', dcbd_trk_client_ip());
    if (!DcbdTrackingDb::checkRateLimit($ipBucket, 120, 60)) {
        http_response_code(429);
        echo json_encode(['ok' => false, 'error' => 'Rate limit exceeded']);
        exit;
    }

    // Handle consent update requests
    if (($data['type'] ?? '') === 'consent') {
        $saved = DcbdTrackingConsent::record($data);
        echo json_encode(['ok' => true, 'consent' => $saved], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Support single event or small batch (max 10 events per request)
    $events = isset($data['events']) && is_array($data['events']) ? array_slice($data['events'], 0, 10) : [$data];
    $results = [];
    foreach ($events as $ev) {
        if (!is_array($ev)) continue;
        $results[] = DcbdTrackingQueue::ingest($ev, 'browser');
    }

    $allOk = !empty($results) && count(array_filter($results, static fn($r) => !empty($r['ok']))) > 0;
    http_response_code($allOk ? 202 : 400);
    echo json_encode([
        'ok'      => $allOk,
        'results' => $results,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Collector error']);
}
