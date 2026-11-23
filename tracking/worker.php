<?php
/**
 * Dream Cart BD — Queue Worker Entry Point (tracking/worker.php)
 * Run via cPanel Cron every 1-5 minutes:
 *   * * * * * /usr/local/bin/php /home/USER/public_html/tracking/worker.php >/dev/null 2>&1
 * Or via protected HTTP cron token:
 *   GET /tracking/worker.php?token=<DCBD_TRK_CRON_TOKEN>
 */

declare(strict_types=1);

require_once __DIR__ . '/queue.php';

$isCli = (PHP_SAPI === 'cli');
if (!$isCli) {
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store');
    $expected = dcbd_trk_env('DCBD_TRK_CRON_TOKEN', '');
    $provided = (string)($_GET['token'] ?? $_SERVER['HTTP_X_CRON_TOKEN'] ?? '');
    if ($expected === '' || $expected === 'CHANGE_ME_RANDOM_CRON_TOKEN' || !hash_equals($expected, $provided)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Unauthorized worker request']);
        exit;
    }
}

$batchSize = max(1, min(100, (int)dcbd_trk_env('DCBD_TRK_QUEUE_BATCH_SIZE', '25')));
$stats = DcbdTrackingQueue::processBatch($batchSize);

// Run retention cleanup once per day around 03:00-03:05 Dhaka time or when --cleanup is passed
$cleanup = null;
if (($isCli && in_array('--cleanup', $argv ?? [], true)) || (date('H') === '03' && (int)date('i') < 5)) {
    $cleanup = DcbdTrackingQueue::runRetentionCleanup();
}

$result = [
    'ok'      => true,
    'ran_at'  => date('c'),
    'stats'   => $stats,
    'cleanup' => $cleanup,
];

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ($isCli ? "\n" : '');
