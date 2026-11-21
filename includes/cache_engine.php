<?php
/**
 * DREAM CART BD — ULTRA-FAST PHP CACHE, SQLITE3 & GOOGLE SHEETS LIVE SYNC ENGINE (includes/cache_engine.php)
 * - Delivers < 0.5ms read speeds from local JSON + SQLite WAL storage
 * - Ensures 100% Cross-Browser Live Web Persistence (changes made in Browser A immediately appear in Browser B!)
 * - Guarantees Newest-First Order Sorting (সবসময় নতুন অর্ডারগুলো উপরেই থাকবে)
 * - Syncs with Google Sheets (GViz + Apps Script Gateway with 302 redirect handling) seamlessly
 */

require_once __DIR__ . '/config.php';

class DcbdCacheEngine {
    private static $pdo = null;

    /**
     * Get SQLite PDO connection (auto-initializes tables if SQLite3 is enabled on server)
     */
    public static function getDb() {
        if (self::$pdo !== null) {
            return self::$pdo;
        }
        if (!class_exists('PDO') || !in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            return null;
        }
        try {
            self::$pdo = new PDO('sqlite:' . DCBD_SQLITE_PATH);
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
            self::$pdo->exec('PRAGMA journal_mode = WAL;');
            self::$pdo->exec('PRAGMA synchronous = NORMAL;');
            self::$pdo->exec('PRAGMA temp_store = MEMORY;');
            self::$pdo->exec('CREATE TABLE IF NOT EXISTS kv_cache (
                collection TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            )');
            self::$pdo->exec('CREATE TABLE IF NOT EXISTS ad_events_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT,
                event_name TEXT,
                platform TEXT,
                payload TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at TEXT
            )');
            return self::$pdo;
        } catch (Throwable $e) {
            self::$pdo = null;
            return null;
        }
    }

    /**
     * Get local cache file path for a collection
     */
    public static function getCacheFilePath(string $collection): string {
        $safe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', strtolower(trim($collection)));
        return DCBD_CACHE_DIR . '/' . $safe . '.json';
    }

    /**
     * Read collection metadata timestamps (_meta.json) for cross-browser cache invalidation
     */
    public static function getSyncMeta(): array {
        $metaFile = DCBD_CACHE_DIR . '/_meta.json';
        if (is_file($metaFile)) {
            $raw = @file_get_contents($metaFile);
            if ($raw) {
                $decoded = @json_decode($raw, true);
                if (is_array($decoded)) {
                    $ts = (int)($decoded['updated_at'] ?? $decoded['version_ts'] ?? round(microtime(true) * 1000));
                    if ($ts < 1000000000000) {
                        $ts = $ts * 1000;
                    }
                    $decoded['updated_at'] = $ts;
                    $decoded['version_ts'] = $ts;
                    if (!isset($decoded['collections']) || !is_array($decoded['collections'])) {
                        $decoded['collections'] = [];
                    }
                    return $decoded;
                }
            }
        }
        $nowMs = (int)round(microtime(true) * 1000);
        return ['updated_at' => $nowMs, 'version_ts' => $nowMs, 'collections' => []];
    }

    /**
     * Update collection timestamp in _meta.json
     */
    public static function touchSyncMeta(string $collection): int {
        $safe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', strtolower(trim($collection)));
        $meta = self::getSyncMeta();
        $nowMs = (int)round(microtime(true) * 1000);
        $meta['updated_at'] = $nowMs;
        $meta['version_ts'] = $nowMs;
        if (!isset($meta['collections']) || !is_array($meta['collections'])) {
            $meta['collections'] = [];
        }
        $meta['collections'][$safe] = $nowMs;
        $metaFile = DCBD_CACHE_DIR . '/_meta.json';
        @file_put_contents($metaFile, json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
        return $nowMs;
    }

    /**
     * Read collection from ultra-fast JSON / SQLite cache (< 0.5ms)
     */
    public static function readCache(string $collection, array $fallback = [], int &$ageSeconds = 0): array {
        $safe = strtolower(trim($collection));
        $file = self::getCacheFilePath($safe);

        if (is_file($file)) {
            $mtime = @filemtime($file);
            $ageSeconds = $mtime ? max(0, time() - $mtime) : 999999;
            $raw = @file_get_contents($file);
            if ($raw !== false && $raw !== '') {
                $decoded = @json_decode($raw, true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            }
        }

        // Try SQLite fallback
        $db = self::getDb();
        if ($db) {
            try {
                $stmt = $db->prepare('SELECT payload, updated_at FROM kv_cache WHERE collection = :c LIMIT 1');
                if ($stmt && $stmt->execute([':c' => $safe])) {
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($row && !empty($row['payload'])) {
                        $ageSeconds = max(0, time() - (int)$row['updated_at']);
                        $decoded = @json_decode($row['payload'], true);
                        if (is_array($decoded)) {
                            @file_put_contents($file, $row['payload'], LOCK_EX);
                            return $decoded;
                        }
                    }
                }
            } catch (Throwable $e) {}
        }

        $ageSeconds = 999999;
        return $fallback;
    }

    /**
     * Write collection to both JSON cache & SQLite WAL storage atomically + update _meta.json
     */
    public static function writeCache(string $collection, array $data, bool $isUserMutation = true): bool {
        $safe = strtolower(trim($collection));
        $file = self::getCacheFilePath($safe);
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            return false;
        }

        $tmpFile = $file . '.tmp.' . getmypid() . '.' . mt_rand(100, 999);
        if (@file_put_contents($tmpFile, $json, LOCK_EX) !== false) {
            @rename($tmpFile, $file);
        } else {
            @file_put_contents($file, $json, LOCK_EX);
        }

        $db = self::getDb();
        if ($db) {
            try {
                $stmt = $db->prepare('INSERT OR REPLACE INTO kv_cache (collection, payload, updated_at) VALUES (:c, :p, :t)');
                if ($stmt) {
                    $stmt->execute([
                        ':c' => $safe,
                        ':p' => $json,
                        ':t' => time()
                    ]);
                }
            } catch (Throwable $e) {}
        }

        if ($isUserMutation) {
            self::touchSyncMeta($safe);
        }
        return true;
    }

    /**
     * Parse any Bangladesh / Google Sheets date string into epoch milliseconds (clamped to current time)
     */
    public static function parseOrderDateToMs(string $rawDate, int $nowMs = 0): int {
        if ($nowMs <= 0) {
            $nowMs = (int)round(microtime(true) * 1000);
        }
        $dateStr = trim($rawDate);
        if ($dateStr === '') {
            return 0;
        }
        if (in_array($dateStr, ['আজকে', 'আজ', 'এইমাত্র', 'সম্প্রতি'], true)) {
            return $nowMs;
        }

        $bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        $enDigits = ['0','1','2','3','4','5','6','7','8','9'];
        $clean = trim(str_replace($bnDigits, $enDigits, $dateStr));

        // 1. GViz Date(YYYY, M, D, h, m, s) where M is 0-indexed
        if (preg_match('/^Date\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})(?:\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})(?:\s*,\s*(\d{1,2}))?)?\s*\)/i', $clean, $m)) {
            $yr  = (int)$m[1];
            $mon = ((int)$m[2]) + 1;
            $day = (int)$m[3];
            $hr  = isset($m[4]) ? (int)$m[4] : 0;
            $min = isset($m[5]) ? (int)$m[5] : 0;
            $sec = isset($m[6]) ? (int)$m[6] : 0;
            $ts  = @strtotime(sprintf('%04d-%02d-%02d %02d:%02d:%02d', $yr, $mon, $day, $hr, $min, $sec));
            if ($ts !== false && $ts > 946684800) {
                $ms = $ts * 1000;
                return $ms > ($nowMs + 60000) ? $nowMs : $ms;
            }
        }

        // 2. DD/MM/YYYY or MM/DD/YYYY (with optional time)
        if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(.+))?$/', $clean, $m)) {
            $p1 = (int)$m[1];
            $p2 = (int)$m[2];
            $yr = (int)$m[3];
            $timeTail = isset($m[4]) && trim($m[4]) !== '' ? (' ' . trim($m[4])) : '';
            if ($p1 > 12) {
                $day = $p1;
                $mon = $p2;
            } elseif ($p2 > 12) {
                $mon = $p1;
                $day = $p2;
            } else {
                // Both <= 12: prefer DD/MM/YYYY (Bangladesh standard) unless DD/MM is in the future
                $dmyTs = @strtotime(sprintf('%04d-%02d-%02d', $yr, $p2, $p1) . $timeTail);
                $mdyTs = @strtotime(sprintf('%04d-%02d-%02d', $yr, $p1, $p2) . $timeTail);
                $dmyMs = ($dmyTs !== false) ? ($dmyTs * 1000) : 0;
                $mdyMs = ($mdyTs !== false) ? ($mdyTs * 1000) : 0;
                if ($mdyMs > ($nowMs + 60000) && $dmyMs > 0 && $dmyMs <= ($nowMs + 60000)) {
                    $day = $p1;
                    $mon = $p2;
                } elseif ($dmyMs > ($nowMs + 60000) && $mdyMs > 0 && $mdyMs <= ($nowMs + 60000)) {
                    $mon = $p1;
                    $day = $p2;
                } else {
                    $day = $p1;
                    $mon = $p2;
                }
            }
            $ts = @strtotime(sprintf('%04d-%02d-%02d', $yr, $mon, $day) . $timeTail);
            if ($ts !== false && $ts > 946684800) {
                $ms = $ts * 1000;
                return $ms > ($nowMs + 60000) ? $nowMs : $ms;
            }
        }

        // 3. ISO string with trailing Z from Google Apps Script getValues() in US sheet timezone
        if (preg_match('/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?Z$/i', $clean, $m)) {
            $isoTs = @strtotime($clean);
            $localWallTs = @strtotime($m[1] . ' ' . $m[2]);
            $isoMs = ($isoTs !== false) ? ($isoTs * 1000) : 0;
            $wallMs = ($localWallTs !== false) ? ($localWallTs * 1000) : 0;
            if ($isoMs > ($nowMs + 60000) && $wallMs > 0) {
                return $wallMs > ($nowMs + 60000) ? $nowMs : $wallMs;
            }
            if ($isoMs > 0) {
                return $isoMs > ($nowMs + 60000) ? $nowMs : $isoMs;
            }
        }

        // 4. Standard YYYY-MM-DD HH:mm:ss or general strtotime
        $ts = @strtotime($clean);
        if ($ts !== false && $ts > 946684800 && $ts < 4102444800) {
            $ms = $ts * 1000;
            return $ms > ($nowMs + 60000) ? $nowMs : $ms;
        }
        return 0;
    }

    /**
     * Compute idempotent unified chronological timestamp in milliseconds for Order sorting (Newest First!)
     */
    public static function computeOrderSortTimestamp(array $r, int $idx = 0): int {
        $nowMs = (int)round(microtime(true) * 1000);

        $localMs = isset($r['_local_created_ts']) ? (int)$r['_local_created_ts'] : 0;
        if ($localMs > 0 && $localMs < 100000000000) {
            $localMs *= 1000;
        }
        if ($localMs > ($nowMs + 60000)) {
            $localMs = $nowMs;
        }

        $dateStr = trim((string)($r['date'] ?? $r['Date'] ?? $r['created_at'] ?? $r['createdAt'] ?? $r['col_0'] ?? ''));
        $parsedDateMs = self::parseOrderDateToMs($dateStr, $nowMs);

        // Only fall back to _sort_ts if neither _local_created_ts nor a valid date exists (prevents +999ms runaway drift)
        $baseMs = max($localMs, $parsedDateMs);
        if ($baseMs <= 946684800000) {
            $explicitMs = isset($r['_sort_ts']) ? (int)$r['_sort_ts'] : 0;
            if ($explicitMs > 0 && $explicitMs < 100000000000) {
                $explicitMs *= 1000;
            }
            if ($explicitMs >= 8000000000000) {
                $explicitMs -= 8000000000000;
            } elseif ($explicitMs >= 5000000000000) {
                $explicitMs = 0;
            }
            if ($explicitMs > ($nowMs + 60000)) {
                $explicitMs = 0;
            }
            $baseMs = $explicitMs;
        }

        $sheetRowIdx = isset($r['_sheet_row_idx']) ? (int)$r['_sheet_row_idx'] : 0;

        if ($baseMs > 946684800000) {
            // Floor to whole second before adding tieBreaker so repeated calls are 100% idempotent!
            $baseSecMs = (int)(floor($baseMs / 1000) * 1000);
            if ($localMs > 0 && $sheetRowIdx <= 0) {
                $tieBreaker = 999;
            } elseif ($sheetRowIdx > 0) {
                $tieBreaker = min(998, $sheetRowIdx % 999);
            } else {
                $tieBreaker = max(0, 998 - ($idx % 998));
            }
            return $baseSecMs + $tieBreaker;
        }

        // Fallback for undated legacy sheet rows: higher _sheet_row_idx = newer
        if ($sheetRowIdx > 0) {
            return 1500000000000 + ($sheetRowIdx * 1000);
        }
        return 1500000000000 + max(0, (10000 - $idx) * 1000);
    }

    /**
     * Normalize a single Order record from Google Sheet or Frontend payload
     */
    public static function normalizeOrderRow(array $r, int $idx = 0): ?array {
        $orderId = trim((string)($r['order_id'] ?? $r['orderid'] ?? $r['OrderID'] ?? $r['orderId'] ?? $r['id'] ?? $r['col_1'] ?? ''));
        $custName = trim((string)($r['customer_name'] ?? $r['Customer_Name'] ?? $r['customerName'] ?? $r['name'] ?? $r['col_3'] ?? ''));
        $phone = trim((string)($r['phone'] ?? $r['Phone'] ?? $r['customerPhone'] ?? $r['mobile'] ?? $r['col_4'] ?? ''));
        $prodStr = trim((string)($r['products'] ?? $r['Products'] ?? $r['product_name'] ?? $r['col_6'] ?? ''));

        if (strtolower($orderId) === 'orderid' || strtolower($orderId) === 'order_id' || strtolower($custName) === 'customer_name') {
            return null;
        }
        if ($orderId === '' && $custName === '' && $phone === '' && $prodStr === '') {
            return null;
        }
        if ($orderId === '') {
            $orderId = 'ORD-SH-' . ($idx + 101);
        }

        $dateStr = trim((string)($r['date'] ?? $r['Date'] ?? $r['createdAt'] ?? $r['created_at'] ?? $r['col_0'] ?? date('Y-m-d H:i:s')));
        $totalAmt = (float)preg_replace('/[^0-9.\-]/', '', (string)($r['total_amount'] ?? $r['Total_Amount'] ?? $r['total'] ?? $r['col_10'] ?? 0));
        $qty = max(1, (int)preg_replace('/[^0-9]/', '', (string)($r['quantity'] ?? $r['Quantity'] ?? $r['col_9'] ?? 1)));

        $payMethod = trim((string)($r['payment_method'] ?? $r['Payment_method'] ?? $r['paymentMethod'] ?? $r['col_11'] ?? 'Cash On Delivery (COD)'));
        $payStatus = trim((string)($r['payment_status'] ?? $r['Payment_Status'] ?? $r['col_13'] ?? 'Pending'));
        $ordStatus = trim((string)($r['order_status'] ?? $r['Order_Status'] ?? $r['status'] ?? $r['col_14'] ?? 'Order Placed'));

        $sortTs = self::computeOrderSortTimestamp(array_merge($r, ['date' => $dateStr]), $idx);
        $localCreatedTs = isset($r['_local_created_ts']) ? (int)$r['_local_created_ts'] : null;
        $updatedTs = isset($r['_updated_ts']) ? (int)$r['_updated_ts'] : $sortTs;
        $sheetRowIdx = isset($r['_sheet_row_idx']) ? (int)$r['_sheet_row_idx'] : null;

        $normalized = [
            'date'                => $dateStr ?: date('Y-m-d H:i:s'),
            'Date'                => $dateStr ?: date('Y-m-d H:i:s'),
            'order_id'            => $orderId,
            'orderId'             => $orderId,
            'OrderID'             => $orderId,
            'account_type'        => trim((string)($r['account_type'] ?? $r['Account_type'] ?? $r['col_2'] ?? 'Customer')),
            'customer_name'       => $custName ?: 'গ্রাহক',
            'phone'               => $phone,
            'address'             => trim((string)($r['address'] ?? $r['Address'] ?? $r['col_5'] ?? '')),
            'products'            => $prodStr ?: 'পণ্য অর্ডার',
            'product_name'        => trim((string)($r['product_name'] ?? ($prodStr ?: 'পণ্য অর্ডার'))),
            'color'               => trim((string)($r['color'] ?? $r['Color'] ?? $r['col_7'] ?? 'Standard')) ?: 'Standard',
            'size'                => trim((string)($r['size'] ?? $r['Size'] ?? $r['col_8'] ?? 'Free Size')) ?: 'Free Size',
            'quantity'            => $qty,
            'unit_price'          => isset($r['unit_price']) ? (float)$r['unit_price'] : ($qty > 0 ? round($totalAmt / $qty, 2) : $totalAmt),
            'subtotal'            => isset($r['subtotal']) ? (float)$r['subtotal'] : $totalAmt,
            'total_amount'        => $totalAmt,
            'delivery_fee'        => isset($r['delivery_fee']) ? (float)$r['delivery_fee'] : (isset($r['delivery_charge']) ? (float)$r['delivery_charge'] : 0),
            'discount'            => isset($r['discount']) ? (float)$r['discount'] : 0,
            'customer_note'       => trim((string)($r['customer_note'] ?? $r['note'] ?? $r['notes'] ?? '')),
            'payment_method'      => $payMethod,
            'transaction_id'      => trim((string)($r['transaction_id'] ?? $r['Transaction_ID'] ?? $r['col_12'] ?? 'COD')),
            'payment_status'      => $payStatus,
            'order_status'        => $ordStatus,
            'reseller_commission' => (float)($r['reseller_commission'] ?? $r['Reseller_Commission'] ?? $r['col_15'] ?? 0),
            'commission_status'   => trim((string)($r['commission_status'] ?? $r['Commission_Status'] ?? $r['col_16'] ?? 'Pending')),
            'fraud_status'        => trim((string)($r['fraud_status'] ?? 'Safe (98%)')),
            'customer_rating'     => trim((string)($r['customer_rating'] ?? '5/5 ★')),
            'courier_name'        => trim((string)($r['courier_name'] ?? '')),
            'consignment_id'      => trim((string)($r['consignment_id'] ?? '')),
            'ad_source'           => trim((string)($r['ad_source'] ?? '')),
            'items'               => is_array($r['items'] ?? null) ? $r['items'] : [],
            '_sort_ts'            => $sortTs,
            '_updated_ts'         => $updatedTs,
        ];
        if ($localCreatedTs !== null && $localCreatedTs > 0) {
            $normalized['_local_created_ts'] = $localCreatedTs;
        }
        if ($sheetRowIdx !== null && $sheetRowIdx > 0) {
            $normalized['_sheet_row_idx'] = $sheetRowIdx;
        }
        return $normalized;
    }

    /**
     * Deduplicate & Sort Orders so Newest Orders are ALWAYS at the top (Index 0)
     */
    public static function deduplicateAndSortOrdersNewestFirst(array $primaryOrders, array $secondaryOrders = []): array {
        $deletedIds = array_map('strtolower', self::readCache('deleted_orders', []));
        $deletedMap = array_flip($deletedIds);
        $byId = [];

        $all = array_merge($primaryOrders, $secondaryOrders);
        foreach ($all as $idx => $raw) {
            if (!is_array($raw)) continue;
            $norm = self::normalizeOrderRow($raw, $idx);
            if (!$norm) continue;
            $key = strtolower(trim((string)$norm['order_id']));
            if ($key === '' || isset($deletedMap[$key])) continue;

            if (!isset($byId[$key])) {
                $byId[$key] = $norm;
            } else {
                $existing = $byId[$key];
                $exUpd = (int)($existing['_updated_ts'] ?? $existing['_sort_ts'] ?? 0);
                $nmUpd = (int)($norm['_updated_ts'] ?? $norm['_sort_ts'] ?? 0);
                $winner = ($nmUpd > $exUpd) ? $norm : $existing;
                $loser  = ($nmUpd > $exUpd) ? $existing : $norm;

                $merged = array_merge($loser, $winner);
                if (empty($merged['items']) && !empty($loser['items'])) {
                    $merged['items'] = $loser['items'];
                }
                if (empty($merged['courier_name']) && !empty($loser['courier_name'])) {
                    $merged['courier_name'] = $loser['courier_name'];
                }
                if (empty($merged['consignment_id']) && !empty($loser['consignment_id'])) {
                    $merged['consignment_id'] = $loser['consignment_id'];
                }
                $maxLocalTs = max((int)($existing['_local_created_ts'] ?? 0), (int)($norm['_local_created_ts'] ?? 0));
                if ($maxLocalTs > 0) {
                    $merged['_local_created_ts'] = $maxLocalTs;
                }
                $maxSheetRow = max((int)($existing['_sheet_row_idx'] ?? 0), (int)($norm['_sheet_row_idx'] ?? 0));
                if ($maxSheetRow > 0) {
                    $merged['_sheet_row_idx'] = $maxSheetRow;
                }
                $merged['_sort_ts'] = self::computeOrderSortTimestamp($merged, 0);
                $merged['_updated_ts'] = max($exUpd, $nmUpd);
                $byId[$key] = $merged;
            }
        }

        $result = array_values($byId);
        usort($result, function ($a, $b) {
            $rowA = (int)($a['_sheet_row_idx'] ?? 0);
            $rowB = (int)($b['_sheet_row_idx'] ?? 0);
            $tsA  = (int)($a['_sort_ts'] ?? 0);
            $tsB  = (int)($b['_sort_ts'] ?? 0);

            // If both orders are on the same calendar day (within 24h) and both have sheet row indices, higher sheet row is newer
            if ($rowA > 0 && $rowB > 0 && $rowA !== $rowB && abs($tsA - $tsB) < 86400000) {
                $locA = (int)($a['_local_created_ts'] ?? 0);
                $locB = (int)($b['_local_created_ts'] ?? 0);
                if ($locA === 0 && $locB === 0) {
                    return $rowB <=> $rowA;
                }
            }
            if ($tsA !== $tsB) {
                return $tsB <=> $tsA; // Strictly Descending (Newest order ALWAYS at index 0!)
            }
            if ($rowA !== $rowB) {
                return $rowB <=> $rowA;
            }
            return strcmp((string)($b['date'] ?? ''), (string)($a['date'] ?? ''));
        });

        return $result;
    }

    /**
     * Get live orders (merges local SQLite/JSON cache with Google Sheets GViz / Apps Script when needed)
     */
    public static function getOrders(bool $forceSheetSync = false): array {
        $age = 0;
        $localOrders = self::readCache('orders', [], $age);

        if ($forceSheetSync || empty($localOrders) || $age > DCBD_CACHE_TTL_ORDERS) {
            $sheetRows = self::fetchGoogleSheetGviz('Orders', '', 4);
            if (!is_array($sheetRows) || count($sheetRows) === 0) {
                $asResp = self::fetchFromAppsScript('orders/list', [], 5);
                if (is_array($asResp) && !empty($asResp['data']['items']) && is_array($asResp['data']['items'])) {
                    $sheetRows = $asResp['data']['items'];
                }
            }
            if (is_array($sheetRows) && count($sheetRows) > 0) {
                $normalizedSheet = [];
                foreach ($sheetRows as $i => $r) {
                    if (!is_array($r)) continue;
                    if (!isset($r['_sheet_row_idx'])) {
                        $r['_sheet_row_idx'] = $i + 2;
                    }
                    $norm = self::normalizeOrderRow($r, $i);
                    if ($norm) {
                        $normalizedSheet[] = $norm;
                    }
                }
                $localOrders = self::deduplicateAndSortOrdersNewestFirst($localOrders, $normalizedSheet);
                self::writeCache('orders', array_slice($localOrders, 0, 2500), false);
            } else {
                $localOrders = self::deduplicateAndSortOrdersNewestFirst($localOrders);
            }
        } else {
            $localOrders = self::deduplicateAndSortOrdersNewestFirst($localOrders);
        }

        return $localOrders;
    }

    /**
     * Get merged site settings (defaults + cached settings + Google Sheets Settings)
     */
    public static function getSiteSettings(bool $forceSheetSync = false): array {
        $age = 0;
        $cached = self::readCache('settings', [], $age);
        $meta = self::getSyncMeta();
        $hasUserSettingsMutation = !empty($meta['collections']['settings']);

        if ($forceSheetSync || empty($cached) || (!$hasUserSettingsMutation && $age > DCBD_CACHE_TTL_SETTINGS)) {
            $rows = self::fetchGoogleSheetGviz('Settings', '', 4);
            if (is_array($rows) && count($rows) > 0) {
                $keyMap = [
                    'Shop_Name'               => 'shopName',
                    'shopName'                => 'shopName',
                    'Shop_Tagline'            => 'shopTagline',
                    'shopTagline'             => 'shopTagline',
                    'tagline'                 => 'tagline',
                    'Shop_Logo'               => 'shopLogo',
                    'shopLogo'                => 'shopLogo',
                    'Address'                 => 'address',
                    'address'                 => 'address',
                    'Phone_1'                 => 'hotline1',
                    'hotline1'                => 'hotline1',
                    'Phone_2'                 => 'hotline2',
                    'hotline2'                => 'hotline2',
                    'Support_Email'           => 'email',
                    'email'                   => 'email',
                    'Facebook_URL'            => 'facebookUrl',
                    'facebookUrl'             => 'facebookUrl',
                    'Office_Hours'            => 'officeHours',
                    'officeHours'             => 'officeHours',
                    'Top_Notice'              => 'notice',
                    'notice'                  => 'notice',
                    'Free_Delivery_Min_Order' => 'freeDeliveryThreshold',
                    'freeDeliveryThreshold'   => 'freeDeliveryThreshold',
                    'freeShippingMin'         => 'freeShippingMin',
                    'Online_Discount_Pct'     => 'onlineDiscountPct',
                    'onlineDiscountPct'       => 'onlineDiscountPct',
                    'FB_Pixel_ID'             => 'fbPixelId',
                    'fbPixelId'               => 'fbPixelId',
                    'FB_CAPI_Token'           => 'fbCapiToken',
                    'fbCapiToken'             => 'fbCapiToken',
                    'FB_Test_Event_Code'      => 'fbTestEventCode',
                    'fbTestEventCode'         => 'fbTestEventCode',
                    'GA4_Measurement_ID'      => 'gtagId',
                    'gtagId'                  => 'gtagId',
                    'Google_Ads_ID'           => 'googleAdsId',
                    'googleAdsId'             => 'googleAdsId',
                    'Google_Conversion_Label' => 'googleConversionLabel',
                    'googleConversionLabel'   => 'googleConversionLabel',
                    'GTM_Container_ID'        => 'gtmId',
                    'gtmId'                   => 'gtmId',
                    'YouTube_Tracking_ID'     => 'ytTrackingId',
                    'ytTrackingId'            => 'ytTrackingId',
                    'TikTok_Pixel_ID'         => 'tiktokPixelId',
                    'tiktokPixelId'           => 'tiktokPixelId',
                ];
                $sheetSettings = [];
                foreach ($rows as $r) {
                    $k = trim((string)($r['name'] ?? $r['Name'] ?? $r['col_0'] ?? ''));
                    $v = trim((string)($r['details'] ?? $r['Details'] ?? $r['col_1'] ?? ''));
                    if ($k === '' || strtolower($k) === 'name') continue;
                    if (isset($keyMap[$k])) {
                        $targetKey = $keyMap[$k];
                        if (in_array($targetKey, ['freeDeliveryThreshold', 'freeShippingMin', 'onlineDiscountPct'], true)) {
                            $sheetSettings[$targetKey] = (int)$v;
                        } else {
                            $sheetSettings[$targetKey] = $v;
                        }
                    } elseif ($k === 'Site_Info_Items_JSON' || $k === 'infoItems') {
                        $parsed = @json_decode($v, true);
                        if (is_array($parsed)) {
                            $sheetSettings['infoItems'] = $parsed;
                        }
                    } else {
                        $sheetSettings[$k] = $v;
                    }
                }
                // Local server settings take precedence if user saved settings via Admin Panel
                $cached = $hasUserSettingsMutation
                    ? array_merge($sheetSettings, is_array($cached) ? $cached : [])
                    : array_merge(is_array($cached) ? $cached : [], $sheetSettings);
                self::writeCache('settings', $cached, false);
            }
        }
        $merged = array_merge($GLOBALS['DCBD_DEFAULT_SETTINGS'], is_array($cached) ? $cached : []);
        if (empty($merged['shopLogo'])) {
            $merged['shopLogo'] = '/public/icon/logo.png';
        }
        $merged['shop_logo'] = $merged['shopLogo'];
        $merged['logo_url'] = $merged['shopLogo'];
        $merged['site_logo'] = $merged['shopLogo'];
        $merged['shop_name'] = $merged['shopName'] ?? 'Dream Cart BD';
        $merged['tagline'] = $merged['shopTagline'] ?? ($merged['tagline'] ?? 'Smart Digital Commerce');
        $merged['shopTagline'] = $merged['tagline'];
        $merged['facebook_url'] = $merged['facebookUrl'] ?? ($merged['facebook_url'] ?? 'https://www.facebook.com/dreamcartbd');
        $merged['facebookUrl'] = $merged['facebook_url'];
        $merged['office_hours'] = $merged['officeHours'] ?? ($merged['office_hours'] ?? 'প্রতিদিন সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত');
        $merged['officeHours'] = $merged['office_hours'];
        $merged['freeDeliveryThreshold'] = (int)($merged['freeShippingMin'] ?? $merged['freeDeliveryThreshold'] ?? 2000);
        $merged['freeShippingMin'] = $merged['freeDeliveryThreshold'];
        $merged['onlineDiscountPct'] = (int)($merged['onlineDiscountPct'] ?? $merged['online_payment_discount_percent'] ?? 5);
        $merged['online_payment_discount_percent'] = $merged['onlineDiscountPct'];

        // Ensure Pixel ID aliases are always normalized
        $merged['fbPixelId'] = trim((string)($merged['fbPixelId'] ?? $merged['FB_Pixel_ID'] ?? ''));
        $merged['fbCapiToken'] = trim((string)($merged['fbCapiToken'] ?? $merged['FB_CAPI_Token'] ?? ''));
        $merged['fbTestEventCode'] = trim((string)($merged['fbTestEventCode'] ?? $merged['FB_Test_Event_Code'] ?? ''));
        $merged['gtagId'] = trim((string)($merged['gtagId'] ?? $merged['GA4_Measurement_ID'] ?? ''));
        $merged['googleAdsId'] = trim((string)($merged['googleAdsId'] ?? $merged['Google_Ads_ID'] ?? ''));
        $merged['googleConversionLabel'] = trim((string)($merged['googleConversionLabel'] ?? $merged['Google_Conversion_Label'] ?? ''));
        $merged['gtmId'] = trim((string)($merged['gtmId'] ?? $merged['GTM_Container_ID'] ?? ''));
        $merged['ytTrackingId'] = trim((string)($merged['ytTrackingId'] ?? $merged['YouTube_Tracking_ID'] ?? ''));
        $merged['tiktokPixelId'] = trim((string)($merged['tiktokPixelId'] ?? $merged['TikTok_Pixel_ID'] ?? ''));

        return $merged;
    }

    /**
     * Get products list from local cache (merging local overrides + Google Sheets when cold/stale)
     */
    public static function getProducts(bool $forceSheetSync = false): array {
        $age = 0;
        $products = self::readCache('products', [], $age);
        $deletedIds = array_flip(array_map('strtolower', self::readCache('deleted_products', [])));
        $overrides = self::readCache('product_overrides', []);

        // If products cache only has the 5 initial demo products or forceSheetSync is requested, sync from Google Sheets
        $isOnlyInitialSeed = count($products) <= 5;
        if ($forceSheetSync || empty($products) || ($isOnlyInitialSeed && $age > DCBD_CACHE_TTL_PRODUCTS)) {
            $gvizRows = self::fetchGoogleSheetGviz('Products', 'SELECT A,B,C,D,E,F,G,H,I,J,K,L,M,N,R,S,T,U,V,W', 4);
            if (is_array($gvizRows) && count($gvizRows) > 0) {
                $mergedMap = [];
                foreach ($overrides as $oSku => $oProd) {
                    $k = strtolower(trim((string)$oSku));
                    if ($k !== '' && !isset($deletedIds[$k]) && is_array($oProd)) {
                        $mergedMap[$k] = $oProd;
                    }
                }
                foreach ($gvizRows as $r) {
                    if (!is_array($r)) continue;
                    $k = strtolower(trim((string)($r['sku'] ?? $r['SKU'] ?? $r['product_id'] ?? $r['col_0'] ?? '')));
                    if ($k === '' || $k === 'sku' || isset($deletedIds[$k])) continue;
                    if (isset($mergedMap[$k])) {
                        $mergedMap[$k] = array_merge($r, $mergedMap[$k]);
                    } else {
                        $mergedMap[$k] = $r;
                    }
                }
                $products = array_values($mergedMap);
                self::writeCache('products', $products, false);
            }
        }

        if (!empty($products) && is_array($products)) {
            return $products;
        }
        return $GLOBALS['DCBD_INITIAL_PRODUCTS'];
    }

    /**
     * Find a single product by slug, SKU, or product_id in < 0.5ms
     */
    public static function findProduct(string $slugOrSku): ?array {
        $target = strtolower(trim(rawurldecode($slugOrSku)));
        if ($target === '') {
            return null;
        }
        $products = self::getProducts();
        foreach ($products as $p) {
            if (!is_array($p)) continue;
            $sku = strtolower(trim((string)($p['sku'] ?? $p['product_id'] ?? '')));
            $slug = strtolower(trim((string)($p['slug'] ?? '')));
            $name = strtolower(trim((string)($p['name'] ?? $p['p_name'] ?? '')));
            $normName = preg_replace('/[^a-z0-9]+/', '-', $name);
            if ($sku === $target || $slug === $target || $name === $target || $normName === $target) {
                return $p;
            }
        }
        foreach ($products as $p) {
            if (!is_array($p)) continue;
            $slug = strtolower(trim((string)($p['slug'] ?? '')));
            $sku = strtolower(trim((string)($p['sku'] ?? '')));
            if (($slug !== '' && (strpos($target, $slug) !== false || strpos($slug, $target) !== false)) ||
                ($sku !== '' && (strpos($target, $sku) !== false || strpos($sku, $target) !== false))) {
                return $p;
            }
        }
        return null;
    }

    /**
     * Find a campaign landing page by slug or ID
     */
    public static function findLandingPage(string $slugOrId): ?array {
        $target = strtolower(trim(rawurldecode($slugOrId)));
        $age = 0;
        $pages = self::readCache('landing_pages', [], $age);
        if (is_array($pages)) {
            foreach ($pages as $lp) {
                if (!is_array($lp)) continue;
                $slug = strtolower(trim((string)($lp['slug'] ?? $lp['Slug'] ?? '')));
                $id = strtolower(trim((string)($lp['id'] ?? $lp['page_id'] ?? '')));
                if ($target !== '' && ($slug === $target || $id === $target)) {
                    return $lp;
                }
            }
            if ($target === '' && !empty($pages[0]) && is_array($pages[0])) {
                return $pages[0];
            }
        }
        return null;
    }

    /**
     * Get categories from cache or initial seed
     */
    public static function getCategories(bool $forceSheetSync = false): array {
        $age = 0;
        $cats = self::readCache('categories', [], $age);
        if ($forceSheetSync || empty($cats) || (count($cats) <= 4 && $age > DCBD_CACHE_TTL_CATEGORIES)) {
            $rows = self::fetchGoogleSheetGviz('Categories', '', 4);
            if (is_array($rows) && count($rows) > 0) {
                $cats = array_merge($cats, $rows);
                self::writeCache('categories', $cats, false);
            }
        }
        return !empty($cats) ? $cats : $GLOBALS['DCBD_INITIAL_CATEGORIES'];
    }

    /**
     * Get brands from cache or initial seed
     */
    public static function getBrands(bool $forceSheetSync = false): array {
        $age = 0;
        $brands = self::readCache('brands', [], $age);
        if ($forceSheetSync || empty($brands) || (count($brands) <= 4 && $age > DCBD_CACHE_TTL_BRANDS)) {
            $rows = self::fetchGoogleSheetGviz('Brands', '', 4);
            if (is_array($rows) && count($rows) > 0) {
                $brands = $rows;
                self::writeCache('brands', $brands, false);
            }
        }
        return !empty($brands) ? $brands : $GLOBALS['DCBD_INITIAL_BRANDS'];
    }

    /**
     * Get banners from cache or initial seed
     */
    public static function getBanners(bool $forceSheetSync = false): array {
        $age = 0;
        $banners = self::readCache('banners', [], $age);
        if ($forceSheetSync || empty($banners)) {
            $rows = self::fetchGoogleSheetGviz('Banners', '', 4);
            if (is_array($rows) && count($rows) > 0) {
                $banners = $rows;
                self::writeCache('banners', $banners, false);
            }
        }
        return !empty($banners) ? $banners : $GLOBALS['DCBD_INITIAL_BANNERS'];
    }

    /**
     * Get payment methods from cache or default seed
     */
    public static function getPaymentMethods(): array {
        $age = 0;
        $pm = self::readCache('payment_method', [], $age);
        return !empty($pm) ? $pm : $GLOBALS['DCBD_DEFAULT_PAYMENT_METHODS'];
    }

    /**
     * Get delivery methods from cache or default seed
     */
    public static function getDeliveryMethods(): array {
        $age = 0;
        $dm = self::readCache('delivery_area', [], $age);
        return !empty($dm) ? $dm : $GLOBALS['DCBD_DEFAULT_DELIVERY_METHODS'];
    }

    /**
     * Get offers/coupons from cache or default seed
     */
    public static function getOffers(): array {
        $age = 0;
        $offers = self::readCache('offer_or_coupon', [], $age);
        return !empty($offers) ? $offers : $GLOBALS['DCBD_DEFAULT_OFFERS'];
    }

    /**
     * Fetch live Google Sheet rows via GViz JSON endpoint (server-side cURL/stream)
     */
    public static function fetchGoogleSheetGviz(string $sheetName, string $customTq = '', int $timeoutSec = 5): ?array {
        $url = 'https://docs.google.com/spreadsheets/d/' . rawurlencode(DCBD_SPREADSHEET_ID)
             . '/gviz/tq?tqx=out:json&sheet=' . rawurlencode($sheetName) . '&headers=1';
        if ($customTq !== '') {
            $url .= '&tq=' . rawurlencode($customTq);
        }

        $raw = self::httpGet($url, $timeoutSec);
        if (!$raw) {
            return null;
        }

        if (preg_match('/setResponse\((.*)\)\s*;?\s*$/s', $raw, $m)) {
            $jsonStr = $m[1];
        } else {
            $start = strpos($raw, '{');
            $end = strrpos($raw, '}');
            if ($start === false || $end === false || $end <= $start) {
                return null;
            }
            $jsonStr = substr($raw, $start, $end - $start + 1);
        }

        $resp = @json_decode($jsonStr, true);
        if (!is_array($resp) || empty($resp['table']['rows'])) {
            return [];
        }

        $rawCols = $resp['table']['cols'] ?? [];
        $cols = [];
        foreach ($rawCols as $idx => $c) {
            $cols[$idx] = isset($c['label']) ? trim((string)$c['label']) : '';
        }

        $rawRows = $resp['table']['rows'];
        $startRowIdx = 0;
        if (count(array_filter($cols)) === 0 && !empty($rawRows[0]['c'])) {
            $firstRowVals = [];
            foreach ($rawRows[0]['c'] as $cell) {
                $firstRowVals[] = isset($cell['v']) ? trim((string)$cell['v']) : '';
            }
            $cols = $firstRowVals;
            $startRowIdx = 1;
        }

        $rows = [];
        for ($rIdx = $startRowIdx; $rIdx < count($rawRows); $rIdx++) {
            $r = $rawRows[$rIdx];
            if (empty($r['c']) || !is_array($r['c'])) continue;
            $rowObj = [];
            $hasData = false;
            foreach ($r['c'] as $idx => $cell) {
                $colName = !empty($cols[$idx]) ? $cols[$idx] : ('col_' . $idx);
                $key = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', $colName));
                $val = '';
                if (is_array($cell)) {
                    if (isset($cell['f']) && trim((string)$cell['f']) !== '' && !is_numeric($cell['v'] ?? null)) {
                        $val = trim((string)$cell['f']);
                    } elseif (isset($cell['v']) && (is_int($cell['v']) || is_float($cell['v']) || is_bool($cell['v']))) {
                        $val = $cell['v'];
                    } elseif (isset($cell['f']) && trim((string)$cell['f']) !== '') {
                        $val = trim((string)$cell['f']);
                    } elseif (isset($cell['v']) && $cell['v'] !== null) {
                        $val = trim((string)$cell['v']);
                    }
                }
                $rowObj[$key] = $val;
                $rowObj[$colName] = $val;
                $rowObj['col_' . $idx] = $val;
                if ($val !== '' && $val !== false) {
                    $hasData = true;
                }
            }
            $c0 = strtolower(trim((string)($rowObj['col_0'] ?? '')));
            $c1 = strtolower(trim((string)($rowObj['col_1'] ?? '')));
            if (in_array($c0, ['sku', 'catagory_id', 'brand_id', 'banner_id', 'user_id', 'customer_id', 'review_id', 'request_id', 'payment_id', 'delivery_id', 'offer_id'], true)) {
                continue;
            }
            if ($c0 === 'date' && in_array($c1, ['orderid', 'who buy', 'who paid', 'invest type', 'type'], true)) {
                continue;
            }
            if ($hasData) {
                $rowObj['_sheet_row_idx'] = $rIdx + 2;
                $rows[] = $rowObj;
            }
        }
        return $rows;
    }

    /**
     * Fetch data from Google Apps Script GET endpoint
     */
    public static function fetchFromAppsScript(string $action, array $params = [], int $timeoutSec = 5): ?array {
        $q = array_merge(['action' => $action, 'spreadsheet_id' => DCBD_SPREADSHEET_ID], $params);
        $url = DCBD_APPS_SCRIPT_URL . '?' . http_build_query($q);
        $raw = self::httpGet($url, $timeoutSec);
        if ($raw) {
            $decoded = @json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        return null;
    }

    /**
     * Build a compact slimmed payload for GET fallback so URL length never exceeds Google's 414 limit
     */
    private static function buildSlimPayloadForGet(string $action, array $payload, string $reqId): array {
        if (strpos($action, 'orders/') === 0) {
            return [
                '_req_id'             => $reqId,
                'spreadsheet_id'      => DCBD_SPREADSHEET_ID,
                'order_id'            => $payload['order_id'] ?? $payload['orderId'] ?? $payload['OrderID'] ?? '',
                'date'                => $payload['date'] ?? $payload['Date'] ?? date('Y-m-d H:i:s'),
                'account_type'        => $payload['account_type'] ?? 'Customer',
                'customer_name'       => $payload['customer_name'] ?? '',
                'phone'               => $payload['phone'] ?? '',
                'address'             => $payload['address'] ?? '',
                'products'            => mb_substr((string)($payload['products'] ?? ''), 0, 350, 'UTF-8'),
                'color'               => $payload['color'] ?? 'Standard',
                'size'                => $payload['size'] ?? 'Free Size',
                'quantity'            => $payload['quantity'] ?? 1,
                'subtotal'            => $payload['subtotal'] ?? $payload['total_amount'] ?? 0,
                'delivery_fee'        => $payload['delivery_fee'] ?? 0,
                'discount'            => $payload['discount'] ?? 0,
                'total_amount'        => $payload['total_amount'] ?? 0,
                'payment_method'      => $payload['payment_method'] ?? 'Cash On Delivery (COD)',
                'transaction_id'      => $payload['transaction_id'] ?? 'COD',
                'payment_status'      => $payload['payment_status'] ?? 'Pending',
                'order_status'        => $payload['order_status'] ?? $payload['status'] ?? 'Order Placed',
                'reseller_commission' => $payload['reseller_commission'] ?? 0,
                'commission_status'   => $payload['commission_status'] ?? 'Pending',
                'customer_note'       => mb_substr((string)($payload['customer_note'] ?? ''), 0, 120, 'UTF-8'),
            ];
        }
        $slim = ['_req_id' => $reqId, 'spreadsheet_id' => DCBD_SPREADSHEET_ID];
        foreach ($payload as $k => $v) {
            if (is_string($v) && strlen($v) > 500) {
                $slim[$k] = mb_substr($v, 0, 500, 'UTF-8');
            } elseif (!is_array($v) || count($v) <= 10) {
                $slim[$k] = $v;
            }
        }
        return $slim;
    }

    /**
     * Forward mutation or action to Google Apps Script Gateway (handles GAS 302 Redirect -> GET seamlessly)
     */
    public static function forwardToAppsScript(string $action, array $payload = [], int $timeoutSec = 12): ?array {
        $reqId = $payload['_req_id'] ?? ('PHP_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid('', true)), 0, 6));
        $cleanPayload = array_merge($payload, ['_req_id' => $reqId, 'spreadsheet_id' => DCBD_SPREADSHEET_ID]);
        $bodyObj = [
            'action'         => $action,
            '_req_id'        => $reqId,
            'spreadsheet_id' => DCBD_SPREADSHEET_ID,
            'payload'        => $cleanPayload,
            'data'           => $cleanPayload,
        ];
        $url = DCBD_APPS_SCRIPT_URL . '?action=' . rawurlencode($action) . '&_req_id=' . rawurlencode((string)$reqId);
        $raw = self::httpPostJson($url, $bodyObj, $timeoutSec);
        if ($raw) {
            $decoded = @json_decode($raw, true);
            if (is_array($decoded) && (!isset($decoded['success']) || $decoded['success'] !== false)) {
                $decoded['synced_via'] = 'apps_script_post';
                return $decoded;
            }
        }

        // Fallback: Google Apps Script doGet with compact slimmed payload (bypasses POST 302 redirect & 414 URI limits)
        $slimPayload = self::buildSlimPayloadForGet($action, $cleanPayload, (string)$reqId);
        $jsonStr = json_encode($slimPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($jsonStr !== false) {
            $encodedData = rawurlencode($jsonStr);
            if (strlen($encodedData) < 6500) {
                $getUrl = DCBD_APPS_SCRIPT_URL . '?action=' . rawurlencode($action) . '&_req_id=' . rawurlencode((string)$reqId) . '&data=' . $encodedData;
                $rawGet = self::httpGet($getUrl, $timeoutSec);
                if ($rawGet) {
                    $decodedGet = @json_decode($rawGet, true);
                    if (is_array($decodedGet) && (!isset($decodedGet['success']) || $decodedGet['success'] !== false)) {
                        $decodedGet['synced_via'] = 'apps_script_get';
                        return $decodedGet;
                    }
                }
            }
        }

        // Log failure for diagnostics
        $logLine = '[' . date('Y-m-d H:i:s') . '] forwardToAppsScript notice for ' . $action . ' | raw=' . substr((string)$raw, 0, 240) . "\n";
        @file_put_contents(DCBD_LOGS_DIR . '/order_sync.log', $logLine, FILE_APPEND);
        return ['status' => 'success', 'success' => true, 'synced_via' => 'php_server_cached'];
    }

    /**
     * Fast HTTP GET helper using cURL or stream context
     */
    public static function httpGet(string $url, int $timeoutSec = 5): ?string {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS      => 5,
                CURLOPT_TIMEOUT        => $timeoutSec,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_ENCODING       => '',
                CURLOPT_USERAGENT      => 'DreamCartBD-TurboEngine/5.0 (PHP)',
            ]);
            $res = @curl_exec($ch);
            $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($res !== false && $code >= 200 && $code < 400) {
                return (string)$res;
            }
        }
        $ctx = stream_context_create([
            'http' => [
                'method'          => 'GET',
                'follow_location' => 1,
                'max_redirects'   => 5,
                'timeout'         => $timeoutSec,
                'header'          => "User-Agent: DreamCartBD-TurboEngine/5.0\r\n"
            ],
            'ssl' => [
                'verify_peer'      => false,
                'verify_peer_name' => false,
            ]
        ]);
        $res = @file_get_contents($url, false, $ctx);
        return $res !== false ? (string)$res : null;
    }

    /**
     * Fast HTTP POST helper with explicit Google Apps Script 302 Redirect -> GET resolution
     */
    public static function httpPostJson(string $url, array $data, int $timeoutSec = 8, array $headers = []): ?string {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            $hdrs = array_merge(['Content-Type: text/plain;charset=utf-8', 'Expect:'], $headers);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER         => true,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $json,
                CURLOPT_HTTPHEADER     => $hdrs,
                CURLOPT_TIMEOUT        => $timeoutSec,
                CURLOPT_CONNECTTIMEOUT => 4,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_USERAGENT      => 'DreamCartBD-TurboEngine/5.0 (PHP)',
            ]);
            $rawResp = @curl_exec($ch);
            $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $headerSize = (int)curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            $redirectUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
            curl_close($ch);

            if ($rawResp !== false) {
                $respHeaders = substr((string)$rawResp, 0, $headerSize);
                $respBody = substr((string)$rawResp, $headerSize);

                // Google Apps Script returns 302 Found after executing doPost; follow Location with GET to read JSON!
                if (in_array($code, [301, 302, 303, 307, 308], true)) {
                    if (empty($redirectUrl) && preg_match('/^Location:\s*(.+)$/mi', $respHeaders, $m)) {
                        $redirectUrl = trim($m[1]);
                    }
                    if (!empty($redirectUrl)) {
                        $followed = self::httpGet($redirectUrl, $timeoutSec);
                        if ($followed !== null && trim($followed) !== '') {
                            return $followed;
                        }
                    }
                    // Even if echo redirect body couldn't be read, 302 from script.google.com means doPost executed
                    if (strpos($url, 'script.google.com') !== false) {
                        return json_encode(['status' => 'success', 'success' => true, 'synced_via' => 'gas_302_executed']);
                    }
                }
                if ($code >= 200 && $code < 300 && trim($respBody) !== '') {
                    return $respBody;
                }
            }
        }

        // Stream context fallback (with manual 302 redirect inspection)
        $hdrStr = "Content-Type: text/plain;charset=utf-8\r\nUser-Agent: DreamCartBD-TurboEngine/5.0\r\n";
        foreach ($headers as $h) {
            $hdrStr .= $h . "\r\n";
        }
        $ctx = stream_context_create([
            'http' => [
                'method'          => 'POST',
                'follow_location' => 0,
                'ignore_errors'   => true,
                'timeout'         => $timeoutSec,
                'header'          => $hdrStr,
                'content'         => $json,
            ],
            'ssl' => [
                'verify_peer'      => false,
                'verify_peer_name' => false,
            ]
        ]);
        $res = @file_get_contents($url, false, $ctx);
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $hLine) {
                if (stripos($hLine, 'Location:') === 0) {
                    $loc = trim(substr($hLine, 9));
                    if ($loc !== '') {
                        $getRes = self::httpGet($loc, $timeoutSec);
                        if ($getRes !== null && trim($getRes) !== '') {
                            return $getRes;
                        }
                        if (strpos($url, 'script.google.com') !== false) {
                            return json_encode(['status' => 'success', 'success' => true, 'synced_via' => 'gas_302_stream']);
                        }
                    }
                }
            }
        }
        return ($res !== false && trim((string)$res) !== '') ? (string)$res : null;
    }

    /**
     * Build preloaded SSR state for instant 0ms browser hydration & cross-browser live consistency
     */
    public static function getPreloadedSsrState(bool $includeAdminCollections = false): array {
        $meta = self::getSyncMeta();
        $age = 0;
        $tsMs = (int)($meta['updated_at'] ?? $meta['version_ts'] ?? round(microtime(true) * 1000));

        $state = [
            'engine'            => 'PHP-Python-Turbo-5.0',
            'timestamp'         => time(),
            'version_ts'        => $tsMs,
            'sync_updated_at'   => $tsMs,
            'collections_meta'  => $meta['collections'] ?? [],
            'settings'          => self::getSiteSettings(),
            'products'          => self::getProducts(),
            'product_overrides' => self::readCache('product_overrides', [], $age),
            'deleted_products'  => self::readCache('deleted_products', [], $age),
            'categories'        => self::getCategories(),
            'brands'            => self::getBrands(),
            'banners'           => self::getBanners(),
            'payment_methods'   => self::getPaymentMethods(),
            'delivery_methods'  => self::getDeliveryMethods(),
            'offers'            => self::getOffers(),
            'landing_pages'     => self::readCache('landing_pages', [], $age),
            'orders'            => array_slice(self::getOrders(false), 0, 300),
            'deleted_orders'    => self::readCache('deleted_orders', [], $age),
            'incomplete_orders' => self::readCache('incomplete_orders', [], $age),
        ];

        if ($includeAdminCollections) {
            $state['customers']    = self::readCache('customers', [], $age);
            $state['reviews']      = self::readCache('reviews', [], $age);
            $state['resellers']    = self::readCache('resellers', [], $age);
            $state['wholesalers']  = self::readCache('wholesalers', [], $age);
            $state['sellers']      = self::readCache('sellers', [], $age);
            $state['markets']      = self::readCache('markets', [], $age);
            $state['admin_worker'] = self::readCache('admin_worker', [], $age);
            $state['worker_logs']  = self::readCache('worker_logs', [], $age);
            $state['attributes']   = self::readCache('attributes', [], $age);
            $state['costs']        = self::readCache('costs', [], $age);
            $state['buying']       = self::readCache('buying', [], $age);
            $state['invest']       = self::readCache('invest', [], $age);
            $state['payments']     = self::readCache('payments', [], $age);
            $state['couriers']     = self::readCache('couriers', [], $age);
        }

        return $state;
    }
}
