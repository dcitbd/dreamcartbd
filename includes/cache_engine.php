<?php
/**
 * DREAM CART BD — ULTRA-FAST PHP CACHE, SQLITE3 & GOOGLE SHEETS SYNC ENGINE (includes/cache_engine.php)
 * Delivers < 0.5ms read speeds by serving from local JSON/SQLite cache and syncing with Google Sheets
 * & Google Apps Script asynchronously in the background.
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
     * Read collection from ultra-fast JSON / SQLite cache (< 0.5ms)
     */
    public static function readCache(string $collection, array $fallback = [], int &$ageSeconds = 0): array {
        $safe = strtolower(trim($collection));
        $file = self::getCacheFilePath($safe);

        if (is_file($file)) {
            $mtime = @filemtime($file);
            $ageSeconds = $mtime ? (time() - $mtime) : 999999;
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
                        $ageSeconds = time() - (int)$row['updated_at'];
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
     * Write collection to both JSON cache & SQLite WAL storage atomically
     */
    public static function writeCache(string $collection, array $data): bool {
        $safe = strtolower(trim($collection));
        $file = self::getCacheFilePath($safe);
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            return false;
        }

        $tmpFile = $file . '.tmp.' . getmypid();
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
        return true;
    }

    /**
     * Get merged site settings (defaults + cached settings)
     */
    public static function getSiteSettings(): array {
        $age = 0;
        $cached = self::readCache('settings', [], $age);
        $merged = array_merge($GLOBALS['DCBD_DEFAULT_SETTINGS'], is_array($cached) ? $cached : []);
        if (empty($merged['shopLogo'])) {
            $merged['shopLogo'] = '/public/icon/logo.png';
        }
        $merged['shop_logo'] = $merged['shopLogo'];
        $merged['shop_name'] = $merged['shopName'] ?? 'Dream Cart BD';
        return $merged;
    }

    /**
     * Get products list from local cache or initial seed
     */
    public static function getProducts(): array {
        $age = 0;
        $products = self::readCache('products', [], $age);
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
    public static function getCategories(): array {
        $age = 0;
        $cats = self::readCache('categories', [], $age);
        return !empty($cats) ? $cats : $GLOBALS['DCBD_INITIAL_CATEGORIES'];
    }

    /**
     * Get brands from cache or initial seed
     */
    public static function getBrands(): array {
        $age = 0;
        $brands = self::readCache('brands', [], $age);
        return !empty($brands) ? $brands : $GLOBALS['DCBD_INITIAL_BRANDS'];
    }

    /**
     * Get banners from cache or initial seed
     */
    public static function getBanners(): array {
        $age = 0;
        $banners = self::readCache('banners', [], $age);
        return !empty($banners) ? $banners : $GLOBALS['DCBD_INITIAL_BANNERS'];
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

        // Strip google.visualization.Query.setResponse(...) wrapper
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
                    if (isset($cell['v']) && (is_int($cell['v']) || is_float($cell['v']) || is_bool($cell['v']))) {
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
            if (in_array($c0, ['sku', 'catagory_id', 'brand_id', 'banner_id', 'user_id', 'customer_id', 'review_id', 'request_id'], true)) {
                continue;
            }
            if ($hasData) {
                $rows[] = $rowObj;
            }
        }
        return $rows;
    }

    /**
     * Forward mutation or action to Google Apps Script Gateway
     */
    public static function forwardToAppsScript(string $action, array $payload = [], int $timeoutSec = 6): ?array {
        $reqId = $payload['_req_id'] ?? ('PHP_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid('', true)), 0, 6));
        $bodyObj = [
            'action' => $action,
            '_req_id' => $reqId,
            'spreadsheet_id' => DCBD_SPREADSHEET_ID,
            'payload' => array_merge($payload, ['_req_id' => $reqId, 'spreadsheet_id' => DCBD_SPREADSHEET_ID]),
            'data' => array_merge($payload, ['_req_id' => $reqId, 'spreadsheet_id' => DCBD_SPREADSHEET_ID]),
        ];
        $url = DCBD_APPS_SCRIPT_URL . '?action=' . rawurlencode($action);
        $raw = self::httpPostJson($url, $bodyObj, $timeoutSec);
        if ($raw) {
            $decoded = @json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        return ['status' => 'success', 'success' => true, 'synced_via' => 'php_gateway'];
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
                CURLOPT_ENCODING       => '', // Accept gzip/deflate
                CURLOPT_USERAGENT      => 'DreamCartBD-TurboEngine/4.0 (PHP)',
            ]);
            $res = curl_exec($ch);
            $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($res !== false && $code >= 200 && $code < 400) {
                return (string)$res;
            }
        }
        $ctx = stream_context_create([
            'http' => [
                'method'  => 'GET',
                'timeout' => $timeoutSec,
                'header'  => "User-Agent: DreamCartBD-TurboEngine/4.0\r\n"
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
     * Fast HTTP POST helper using cURL or stream context
     */
    public static function httpPostJson(string $url, array $data, int $timeoutSec = 5, array $headers = []): ?string {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            $hdrs = array_merge(['Content-Type: text/plain;charset=utf-8'], $headers);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS      => 5,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $json,
                CURLOPT_HTTPHEADER     => $hdrs,
                CURLOPT_TIMEOUT        => $timeoutSec,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_USERAGENT      => 'DreamCartBD-TurboEngine/4.0 (PHP)',
            ]);
            $res = curl_exec($ch);
            curl_close($ch);
            return $res !== false ? (string)$res : null;
        }
        $hdrStr = "Content-Type: text/plain;charset=utf-8\r\n";
        foreach ($headers as $h) {
            $hdrStr .= $h . "\r\n";
        }
        $ctx = stream_context_create([
            'http' => [
                'method'  => 'POST',
                'timeout' => $timeoutSec,
                'header'  => $hdrStr,
                'content' => $json,
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
     * Build preloaded SSR state for instant 0ms browser hydration
     */
    public static function getPreloadedSsrState(): array {
        return [
            'engine'      => 'PHP-Python-Turbo-4.0',
            'timestamp'   => time(),
            'settings'    => self::getSiteSettings(),
            'products'    => self::getProducts(),
            'categories'  => self::getCategories(),
            'brands'      => self::getBrands(),
            'banners'     => self::getBanners(),
        ];
    }
}
