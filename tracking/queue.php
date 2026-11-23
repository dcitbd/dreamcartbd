<?php
/**
 * Dream Cart BD — Durable Event Queue, Order Integrity & Retry Engine (tracking/queue.php)
 * Features:
 * - Atomic SQLite lease locking to prevent concurrent double-processing
 * - Exponential backoff with jitter (15s, 45s, 135s, 405s, dead_letter)
 * - Authoritative server-side purchase event enqueueing with UNIQUE(order_id, milestone) deduplication
 * - COD vs Verified Payment distinction & configurable trigger rules
 * - Safe admin replay & automated retention cleanup
 */

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/schema.php';
require_once __DIR__ . '/consent.php';
require_once __DIR__ . '/adapters/MetaCapiAdapter.php';
require_once __DIR__ . '/adapters/Ga4MpAdapter.php';
require_once __DIR__ . '/adapters/TikTokEventsAdapter.php';
require_once __DIR__ . '/adapters/GoogleAdsAdapter.php';

class DcbdTrackingQueue {
    /**
     * Persist a normalized canonical event and fan out queue jobs to all enabled, consent-permitted server adapters.
     */
    public static function ingest(array $rawPayload, string $sourceOrigin = 'browser'): array {
        $settings = DcbdTrackingDb::getSettings();
        if (empty($settings['master_enabled'])) {
            return ['ok' => true, 'skipped' => true, 'reason' => 'master_disabled'];
        }

        $norm = DcbdTrackingSchema::normalize($rawPayload, $sourceOrigin);
        if (!$norm['valid']) {
            return ['ok' => false, 'error' => $norm['error']];
        }
        $ev = $norm['event'];
        $pdo = DcbdTrackingDb::pdo();
        $nowIso = date('c');
        $nowTs = time();

        // Deduplicate by event_id (idempotent insert)
        $stmt = $pdo->prepare('INSERT OR IGNORE INTO dcbd_trk_events
            (event_id, schema_version, event_name, event_time, event_source_url, action_source, currency, value, order_id, payment_state, consent_state_json, attribution_json, items_json, user_context_json, payload_json, is_test, source_origin, created_at)
            VALUES (:eid, :sv, :en, :et, :url, :asrc, :cur, :val, :oid, :ps, :cs, :at, :it, :uc, :pl, :tst, :so, :ca)');
        $stmt->execute([
            ':eid'  => $ev['event_id'],
            ':sv'   => $ev['schema_version'],
            ':en'   => $ev['event_name'],
            ':et'   => $ev['event_time'],
            ':url'  => $ev['event_source_url'],
            ':asrc' => $ev['action_source'],
            ':cur'  => $ev['currency'],
            ':val'  => $ev['value'],
            ':oid'  => $ev['order_id'],
            ':ps'   => $ev['payment_state'],
            ':cs'   => json_encode($ev['consent_state'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':at'   => json_encode($ev['attribution'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':it'   => json_encode($ev['items'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':uc'   => json_encode($ev['user_context'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':pl'   => json_encode($ev['extra'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':tst'  => $ev['is_test'],
            ':so'   => $ev['source_origin'],
            ':ca'   => $nowIso,
        ]);

        $inserted = $stmt->rowCount() > 0;
        if (!$inserted) {
            return ['ok' => true, 'duplicate' => true, 'event_id' => $ev['event_id'], 'queued' => 0];
        }

        // Fan out to enabled & consent-permitted server adapters
        $maxAttempts = max(1, min(10, (int)dcbd_trk_env('DCBD_TRK_QUEUE_MAX_ATTEMPTS', '5')));
        $qStmt = $pdo->prepare('INSERT OR IGNORE INTO dcbd_trk_queue
            (event_id, provider, status, attempts, max_attempts, next_attempt_at, created_at, updated_at)
            VALUES (:eid, :prov, "pending", 0, :ma, :na, :ca, :ua)');

        $queuedProviders = [];
        foreach (DcbdTrackingAdapterRegistry::all() as $name => $adapter) {
            if (!$adapter->isEnabled($settings)) continue;
            if (!DcbdTrackingConsent::isPermitted($ev['consent_state'], $adapter->getConsentCategory(), $settings)) {
                continue;
            }
            if ($adapter->mapEvent($ev, $settings) === null) {
                continue;
            }
            $qStmt->execute([
                ':eid'  => $ev['event_id'],
                ':prov' => $name,
                ':ma'   => $maxAttempts,
                ':na'   => $nowTs,
                ':ca'   => $nowIso,
                ':ua'   => $nowIso,
            ]);
            if ($qStmt->rowCount() > 0) {
                $queuedProviders[] = $name;
            }
        }

        return [
            'ok'        => true,
            'duplicate' => false,
            'event_id'  => $ev['event_id'],
            'queued'    => count($queuedProviders),
            'providers' => $queuedProviders,
        ];
    }

    /**
     * Authoritative Server-Side Order Event Enqueueing (called strictly from api/index.php after order persistence).
     * Never trusts browser totals; prevents duplicate purchases; enforces COD vs verified payment rules.
     */
    public static function enqueueOrderEvent(array $orderRecord, string $trigger = 'order_placed'): array {
        try {
            $settings = DcbdTrackingDb::getSettings();
            if (empty($settings['master_enabled'])) {
                return ['ok' => true, 'skipped' => true, 'reason' => 'master_disabled'];
            }

            $orderId = trim((string)($orderRecord['order_id'] ?? $orderRecord['orderId'] ?? ''));
            if ($orderId === '') {
                return ['ok' => false, 'error' => 'Missing order_id'];
            }

            $orderStatus = strtolower(trim((string)($orderRecord['order_status'] ?? 'order placed')));
            $paymentMethod = strtoupper(trim((string)($orderRecord['payment_method'] ?? 'COD')));
            $paymentStatus = strtolower(trim((string)($orderRecord['payment_status'] ?? 'pending')));

            // Block cancelled, rejected, failed, fraudulent, or test orders from firing Purchase
            $blockedStatuses = ['cancelled', 'canceled', 'rejected', 'failed', 'fraud', 'fake', 'test', 'returned'];
            if (in_array($orderStatus, $blockedStatuses, true) || !empty($orderRecord['is_test_order'])) {
                return ['ok' => true, 'skipped' => true, 'reason' => 'blocked_order_status:' . $orderStatus];
            }

            $isCod = str_contains($paymentMethod, 'COD') || str_contains($paymentMethod, 'CASH');
            $isVerifiedPaid = in_array($orderStatus, ['delivered', 'completed', 'success'], true)
                || ($paymentStatus === 'verified');

            // Distinguish COD order placement from verified payment
            if ($isVerifiedPaid) {
                $paymentState = 'payment_verified';
            } elseif ($isCod) {
                $paymentState = 'cod_order_placed_unpaid';
            } else {
                $paymentState = 'online_trx_submitted_unverified';
            }

            // Apply configurable business rule for when marketing platforms receive Purchase
            $rule = (string)($settings['purchase_trigger_rule'] ?? 'order_placed');
            if ($rule === 'verified_paid_only' && !$isVerifiedPaid) {
                return ['ok' => true, 'skipped' => true, 'reason' => 'awaiting_verified_payment'];
            }

            $milestone = 'purchase';
            $eventId = DcbdTrackingSchema::generateEventId('purchase', $orderId);
            $pdo = DcbdTrackingDb::pdo();

            // Check strict order-level deduplication BEFORE emitting
            $check = $pdo->prepare('SELECT event_id FROM dcbd_trk_orders WHERE order_id = :oid AND milestone = :ms');
            $check->execute([':oid' => $orderId, ':ms' => $milestone]);
            if ($check->fetch()) {
                return ['ok' => true, 'duplicate' => true, 'order_id' => $orderId, 'event_id' => $eventId];
            }

            // Accounting rule: match site's actual totals
            $subtotal = (float)($orderRecord['subtotal'] ?? 0);
            $shipping = (float)($orderRecord['delivery_fee'] ?? $orderRecord['delivery_charge'] ?? 0);
            $discount = (float)($orderRecord['discount'] ?? 0);
            $totalAmount = (float)($orderRecord['total_amount'] ?? $orderRecord['total'] ?? 0);
            if ($subtotal <= 0 && $totalAmount > 0) {
                $subtotal = max(0.0, $totalAmount - $shipping + $discount);
            }
            $reportedValue = !empty($settings['value_includes_shipping'])
                ? $totalAmount
                : max(0.0, $subtotal - $discount);

            $items = [];
            if (!empty($orderRecord['items']) && is_array($orderRecord['items'])) {
                foreach ($orderRecord['items'] as $it) {
                    if (!is_array($it)) continue;
                    $items[] = [
                        'item_id'       => (string)($it['sku'] ?? $it['product_id'] ?? $it['id'] ?? ''),
                        'item_name'     => (string)($it['name'] ?? $it['p_name'] ?? 'Product'),
                        'price'         => (float)($it['price'] ?? $it['selling_price'] ?? 0),
                        'quantity'      => max(1, (int)($it['quantity'] ?? 1)),
                        'item_category' => (string)($it['category'] ?? ''),
                    ];
                }
            }

            // Capture permitted first-party cookies/attribution if available
            $attribution = [
                'fbc'        => (string)($_COOKIE['_fbc'] ?? ''),
                'fbp'        => (string)($_COOKIE['_fbp'] ?? ''),
                'gclid'      => (string)($_COOKIE['dcbd_gclid'] ?? ''),
                'wbraid'     => (string)($_COOKIE['dcbd_wbraid'] ?? ''),
                'gbraid'     => (string)($_COOKIE['dcbd_gbraid'] ?? ''),
                'ttclid'     => (string)($_COOKIE['dcbd_ttclid'] ?? ''),
                'utm_source' => (string)($_COOKIE['dcbd_utm_source'] ?? ''),
            ];
            if (!empty($_COOKIE['_ga']) && preg_match('/^GA\d+\.\d+\.(\d+\.\d+)$/', (string)$_COOKIE['_ga'], $m)) {
                $attribution['ga_client_id'] = $m[1];
            }

            // Respect browser consent cookie if present; otherwise apply configured defaults
            $consentState = [
                'necessary' => true,
                'analytics' => ($settings['consent_default_analytics'] ?? 'granted') === 'granted',
                'marketing' => ($settings['consent_default_marketing'] ?? 'granted') === 'granted',
                'gpc'       => isset($_SERVER['HTTP_SEC_GPC']) && $_SERVER['HTTP_SEC_GPC'] === '1',
                'timestamp' => date('c'),
            ];
            if (!empty($_COOKIE['dcbd_trk_consent'])) {
                $parsedConsent = @json_decode((string)$_COOKIE['dcbd_trk_consent'], true);
                if (is_array($parsedConsent)) {
                    $consentState['analytics'] = !empty($parsedConsent['analytics']);
                    $consentState['marketing'] = !empty($parsedConsent['marketing']);
                }
            }

            $insOrder = $pdo->prepare('INSERT OR IGNORE INTO dcbd_trk_orders
                (order_id, milestone, event_id, order_status, payment_method, payment_status, payment_state, subtotal, shipping, discount, total_value, currency, dispatched_at)
                VALUES (:oid, :ms, :eid, :os, :pm, :pst, :ps, :sub, :shp, :dis, :tot, "BDT", :dt)');
            $insOrder->execute([
                ':oid' => $orderId,
                ':ms'  => $milestone,
                ':eid' => $eventId,
                ':os'  => $orderStatus,
                ':pm'  => $paymentMethod,
                ':pst' => $paymentStatus,
                ':ps'  => $paymentState,
                ':sub' => $subtotal,
                ':shp' => $shipping,
                ':dis' => $discount,
                ':tot' => $reportedValue,
                ':dt'  => date('c'),
            ]);
            if ($insOrder->rowCount() === 0) {
                return ['ok' => true, 'duplicate' => true, 'order_id' => $orderId, 'event_id' => $eventId];
            }

            return self::ingest([
                'event_name'       => 'purchase',
                'event_id'         => $eventId,
                'event_time'       => time(),
                'event_source_url' => 'https://dreamcartbd.com/order-success?orderId=' . rawurlencode($orderId),
                'currency'         => 'BDT',
                'value'            => $reportedValue,
                'shipping'         => $shipping,
                'discount'         => $discount,
                'payment_type'     => $paymentMethod,
                'order_id'         => $orderId,
                'payment_state'    => $paymentState,
                'items'            => $items,
                'consent_state'    => $consentState,
                'attribution'      => $attribution,
                'user_data'        => [
                    'phone'      => (string)($orderRecord['phone'] ?? ''),
                    'email'      => (string)($orderRecord['email'] ?? ''),
                    'first_name' => (string)($orderRecord['customer_name'] ?? ''),
                ],
            ], 'server_order');
        } catch (Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Claim and process pending/failed queue jobs with atomic lease locking & exponential backoff + jitter.
     */
    public static function processBatch(int $limit = 25): array {
        $pdo = DcbdTrackingDb::pdo();
        $settings = DcbdTrackingDb::getSettings();
        $now = time();
        $leaseToken = 'worker_' . getmypid() . '_' . bin2hex(random_bytes(6));
        $leaseExpires = $now + 60;

        // Release expired leases from crashed workers
        $pdo->prepare('UPDATE dcbd_trk_queue SET status = "failed", lease_token = NULL, lease_expires_at = NULL WHERE status = "processing" AND lease_expires_at IS NOT NULL AND lease_expires_at < :now')
            ->execute([':now' => $now]);

        // Select due jobs
        $sel = $pdo->prepare('SELECT id FROM dcbd_trk_queue WHERE status IN ("pending", "failed") AND next_attempt_at <= :now ORDER BY id ASC LIMIT :lim');
        $sel->bindValue(':now', $now, PDO::PARAM_INT);
        $sel->bindValue(':lim', max(1, min(100, $limit)), PDO::PARAM_INT);
        $sel->execute();
        $ids = array_column($sel->fetchAll(), 'id');

        if (empty($ids)) {
            return ['processed' => 0, 'delivered' => 0, 'retried' => 0, 'dead_letter' => 0];
        }

        // Atomically claim jobs with lease_token
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $claimSql = "UPDATE dcbd_trk_queue SET status = 'processing', lease_token = ?, lease_expires_at = ?, updated_at = ? WHERE id IN ({$placeholders}) AND status IN ('pending', 'failed')";
        $claimParams = array_merge([$leaseToken, $leaseExpires, date('c')], $ids);
        $pdo->prepare($claimSql)->execute($claimParams);

        $jobsStmt = $pdo->prepare('SELECT q.*, e.schema_version, e.event_name, e.event_time, e.event_source_url, e.action_source, e.currency, e.value, e.order_id, e.payment_state, e.consent_state_json, e.attribution_json, e.items_json, e.user_context_json, e.payload_json, e.is_test
            FROM dcbd_trk_queue q
            JOIN dcbd_trk_events e ON e.event_id = q.event_id
            WHERE q.lease_token = :lt');
        $jobsStmt->execute([':lt' => $leaseToken]);
        $jobs = $jobsStmt->fetchAll();

        $stats = ['processed' => 0, 'delivered' => 0, 'retried' => 0, 'dead_letter' => 0];
        foreach ($jobs as $job) {
            $stats['processed']++;
            $adapter = DcbdTrackingAdapterRegistry::get((string)$job['provider']);
            $attemptNo = ((int)$job['attempts']) + 1;
            $maxAttempts = (int)$job['max_attempts'];

            $canonical = [
                'schema_version'   => $job['schema_version'],
                'event_id'         => $job['event_id'],
                'event_name'       => $job['event_name'],
                'event_time'       => (int)$job['event_time'],
                'event_source_url' => $job['event_source_url'],
                'action_source'    => $job['action_source'],
                'currency'         => $job['currency'],
                'value'            => (float)$job['value'],
                'order_id'         => $job['order_id'],
                'payment_state'    => $job['payment_state'],
                'consent_state'    => json_decode((string)$job['consent_state_json'], true) ?: [],
                'attribution'      => json_decode((string)$job['attribution_json'], true) ?: [],
                'items'            => json_decode((string)$job['items_json'], true) ?: [],
                'user_context'     => json_decode((string)$job['user_context_json'], true) ?: [],
                'extra'            => json_decode((string)$job['payload_json'], true) ?: [],
                'is_test'          => (int)$job['is_test'],
            ];

            if (!$adapter || !$adapter->isEnabled($settings)) {
                $res = ['ok' => false, 'retryable' => false, 'http_code' => 0, 'latency_ms' => 0, 'summary' => 'Adapter disabled or missing', 'error' => 'Adapter disabled'];
            } elseif (!DcbdTrackingConsent::isPermitted($canonical['consent_state'], $adapter->getConsentCategory(), $settings)) {
                $res = ['ok' => false, 'retryable' => false, 'http_code' => 0, 'latency_ms' => 0, 'summary' => 'Consent revoked before delivery', 'error' => 'Consent denied'];
            } else {
                $res = $adapter->send($canonical, $settings, !empty($canonical['is_test']) || !empty($settings['test_mode']));
            }

            $nowIso = date('c');
            if (!empty($res['ok'])) {
                $newStatus = 'delivered';
                $nextAttempt = 0;
                $stats['delivered']++;
            } elseif (!empty($res['retryable']) && $attemptNo < $maxAttempts) {
                $newStatus = 'failed';
                // Exponential backoff: 15s * 3^(attempt-1) + jitter(0..10s)
                $delay = (int)(15 * pow(3, $attemptNo - 1)) + random_int(0, 10);
                $nextAttempt = time() + $delay;
                $stats['retried']++;
            } else {
                $newStatus = 'dead_letter';
                $nextAttempt = 0;
                $stats['dead_letter']++;
            }

            $pdo->prepare('UPDATE dcbd_trk_queue SET status = :st, attempts = :att, next_attempt_at = :na, lease_token = NULL, lease_expires_at = NULL, last_http_code = :hc, last_error = :err, updated_at = :ua WHERE id = :id')
                ->execute([
                    ':st'  => $newStatus,
                    ':att' => $attemptNo,
                    ':na'  => $nextAttempt,
                    ':hc'  => (int)($res['http_code'] ?? 0),
                    ':err' => substr((string)($res['error'] ?? ''), 0, 400),
                    ':ua'  => $nowIso,
                    ':id'  => (int)$job['id'],
                ]);

            $pdo->prepare('INSERT INTO dcbd_trk_delivery_logs (queue_id, event_id, provider, attempt_no, status, http_code, latency_ms, response_summary, error_message, is_test, created_at)
                VALUES (:qid, :eid, :prov, :att, :st, :hc, :lat, :sum, :err, :tst, :ca)')
                ->execute([
                    ':qid'  => (int)$job['id'],
                    ':eid'  => (string)$job['event_id'],
                    ':prov' => (string)$job['provider'],
                    ':att'  => $attemptNo,
                    ':st'   => $newStatus,
                    ':hc'   => (int)($res['http_code'] ?? 0),
                    ':lat'  => (int)($res['latency_ms'] ?? 0),
                    ':sum'  => substr((string)($res['summary'] ?? ''), 0, 400),
                    ':err'  => substr((string)($res['error'] ?? ''), 0, 400),
                    ':tst'  => (int)$job['is_test'],
                    ':ca'   => $nowIso,
                ]);
        }

        return $stats;
    }

    /**
     * Safely replay a failed or dead_letter queue job (preserves original event_id for provider deduplication)
     */
    public static function replayJob(int $queueId): bool {
        $pdo = DcbdTrackingDb::pdo();
        $stmt = $pdo->prepare('UPDATE dcbd_trk_queue SET status = "pending", attempts = 0, next_attempt_at = :now, lease_token = NULL, lease_expires_at = NULL, last_error = "", updated_at = :ua WHERE id = :id AND status IN ("failed", "dead_letter")');
        $stmt->execute([
            ':now' => time(),
            ':ua'  => date('c'),
            ':id'  => $queueId,
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Retention cleanup (deletes delivered logs & old events past configured retention_days)
     */
    public static function runRetentionCleanup(): array {
        $pdo = DcbdTrackingDb::pdo();
        $settings = DcbdTrackingDb::getSettings();
        $days = max(7, min(365, (int)($settings['retention_days'] ?? 90)));
        $cutoffIso = date('c', time() - ($days * 86400));

        $dLogs = $pdo->prepare('DELETE FROM dcbd_trk_delivery_logs WHERE created_at < :c');
        $dLogs->execute([':c' => $cutoffIso]);

        $dQueue = $pdo->prepare('DELETE FROM dcbd_trk_queue WHERE status = "delivered" AND updated_at < :c');
        $dQueue->execute([':c' => $cutoffIso]);

        $dEvents = $pdo->prepare('DELETE FROM dcbd_trk_events WHERE created_at < :c');
        $dEvents->execute([':c' => $cutoffIso]);

        $dRates = $pdo->prepare('DELETE FROM dcbd_trk_rate_limits WHERE window_start < :w');
        $dRates->execute([':w' => time() - 3600]);

        return [
            'retention_days' => $days,
            'deleted_logs'   => $dLogs->rowCount(),
            'deleted_queue'  => $dQueue->rowCount(),
            'deleted_events' => $dEvents->rowCount(),
        ];
    }
}
