<?php
/**
 * DREAM CART BD — ULTRA-HIGH-SPEED PHP API GATEWAY & GOOGLE SHEETS ACCELERATOR (api/index.php)
 * - Serves all 60+ Storefront, Partner & Admin actions in < 1ms from local SQLite/JSON cache.
 * - Synchronizes mutations and live sheets with Google Sheets (1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8)
 *   and Google Apps Script Gateway seamlessly.
 * - Handles Server-Side Ad Pixel & Conversions API (`pixels/track`) for Facebook, Instagram, YouTube, Google & TikTok.
 */

require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/cache_engine.php';
require_once dirname(__DIR__) . '/includes/pixel_tracker.php';

if (!headers_sent()) {
    if (extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
        @ob_start('ob_gzhandler');
    }
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('X-Turbo-Engine: DreamCartBD-PHP-4.0');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok', 'success' => true]);
    exit;
}

// Parse incoming action & payload (supports GET, POST JSON, and POST form-urlencoded)
$action  = $_GET['action'] ?? ($_POST['action'] ?? '');
$payload = [];

$rawBody = @file_get_contents('php://input');
if ($rawBody !== false && trim($rawBody) !== '') {
    $parsed = @json_decode($rawBody, true);
    if (is_array($parsed)) {
        if (empty($action) && !empty($parsed['action'])) {
            $action = (string)$parsed['action'];
        }
        if (isset($parsed['payload']) && is_array($parsed['payload'])) {
            $payload = $parsed['payload'];
        } elseif (isset($parsed['data']) && is_array($parsed['data'])) {
            $payload = $parsed['data'];
        } else {
            $payload = $parsed;
        }
    }
}

if (empty($payload) && !empty($_GET['data'])) {
    $d = @json_decode((string)$_GET['data'], true);
    if (is_array($d)) $payload = $d;
}
if (empty($payload)) {
    $payload = array_merge($_GET ?? [], $_POST ?? []);
}

$action = strtolower(trim((string)$action, " \t\n\r\0\x0B-_/") ?: 'system/health');
$action = str_replace('landing-pages', 'landing_pages', $action);
if ($action === 'settings/save') $action = 'settings/update';
if ($action === 'landing_pages/save') $action = 'landing_pages/add';

$startTime = microtime(true);
$response  = ['status' => 'success', 'success' => true];

try {
    switch ($action) {
        case 'system/health':
            $response = [
                'status'  => 'success',
                'success' => true,
                'data'    => [
                    'status'         => 'UP',
                    'app'            => 'Dream Cart BD',
                    'engine'         => 'PHP + Python Ultra-High-Speed Engine',
                    'version'        => DCBD_VERSION,
                    'spreadsheet_id' => DCBD_SPREADSHEET_ID,
                    'time'           => date('c'),
                ]
            ];
            break;

        // --- OMNI-CHANNEL AD PIXEL & SERVER-SIDE CONVERSIONS API (CAPI) ---
        case 'pixels/track':
        case 'pixel/track':
        case 'capi/track':
            $response = DcbdPixelTracker::dispatchServerEvent($payload);
            break;

        // --- PRODUCTS ---
        case 'products/list':
            $age = 0;
            $items = DcbdCacheEngine::readCache('products', [], $age);
            if (empty($items) || !empty($payload['force'])) {
                $gvizRows = DcbdCacheEngine::fetchGoogleSheetGviz('Products', 'SELECT A,B,C,D,E,F,G,H,I,J,K,L,M,N,R,S,T,U,V,W', 4);
                if (is_array($gvizRows) && count($gvizRows) > 0) {
                    $items = $gvizRows;
                    DcbdCacheEngine::writeCache('products', $items);
                } elseif (empty($items)) {
                    $items = $GLOBALS['DCBD_INITIAL_PRODUCTS'];
                }
            }
            $response = [
                'status'     => 'success',
                'success'    => true,
                'cache_age'  => $age,
                'latency_ms' => round((microtime(true) - $startTime) * 1000, 2),
                'data'       => [
                    'items' => $items,
                    'total' => count($items),
                ]
            ];
            break;

        case 'products/details':
            $target = (string)($payload['id'] ?? $payload['slug'] ?? $payload['sku'] ?? '');
            $found  = DcbdCacheEngine::findProduct($target);
            if ($found) {
                $response = ['status' => 'success', 'success' => true, 'data' => $found];
            } else {
                $response = ['status' => 'error', 'success' => false, 'message' => 'পণ্য পাওয়া যায়নি'];
            }
            break;

        case 'products/add':
        case 'products/create':
        case 'products/update':
            $age   = 0;
            $items = DcbdCacheEngine::readCache('products', $GLOBALS['DCBD_INITIAL_PRODUCTS'], $age);
            $sku   = strtolower(trim((string)($payload['sku'] ?? $payload['SKU'] ?? $payload['product_id'] ?? ('DCBD-' . rand(1000, 9999)))));
            $updated = false;
            foreach ($items as $idx => $p) {
                $pSku = strtolower(trim((string)($p['sku'] ?? $p['SKU'] ?? $p['product_id'] ?? '')));
                if ($pSku === $sku) {
                    $items[$idx] = array_merge($p, $payload);
                    $updated = true;
                    break;
                }
            }
            if (!$updated) {
                array_unshift($items, $payload);
            }
            DcbdCacheEngine::writeCache('products', $items);
            DcbdCacheEngine::forwardToAppsScript('products/add', $payload, 4);
            $response = ['status' => 'success', 'success' => true, 'data' => $payload, 'message' => 'পণ্যটি লোকাল ক্যাশ ও গুগল শিটে সংরক্ষিত হয়েছে!'];
            break;

        case 'products/delete':
            $age   = 0;
            $items = DcbdCacheEngine::readCache('products', [], $age);
            $target = strtolower(trim((string)($payload['id'] ?? $payload['sku'] ?? $payload['slug'] ?? '')));
            if ($target !== '' && !empty($items)) {
                $items = array_values(array_filter($items, function($p) use ($target) {
                    $s = strtolower(trim((string)($p['sku'] ?? $p['product_id'] ?? '')));
                    $sl = strtolower(trim((string)($p['slug'] ?? '')));
                    return $s !== $target && $sl !== $target;
                }));
                DcbdCacheEngine::writeCache('products', $items);
            }
            DcbdCacheEngine::forwardToAppsScript('products/delete', $payload, 4);
            $response = ['status' => 'success', 'success' => true, 'message' => 'পণ্যটি মুছে ফেলা হয়েছে।'];
            break;

        // --- CATEGORIES ---
        case 'categories/list':
            $age  = 0;
            $cats = DcbdCacheEngine::readCache('categories', [], $age);
            if (empty($cats) || !empty($payload['force'])) {
                $rows = DcbdCacheEngine::fetchGoogleSheetGviz('Categories', '', 4);
                if (is_array($rows) && count($rows) > 0) {
                    $cats = $rows;
                    DcbdCacheEngine::writeCache('categories', $cats);
                } elseif (empty($cats)) {
                    $cats = $GLOBALS['DCBD_INITIAL_CATEGORIES'];
                }
            }
            $response = ['status' => 'success', 'success' => true, 'data' => ['items' => $cats, 'total' => count($cats)]];
            break;

        case 'categories/add':
        case 'categories/create':
        case 'categories/update':
            $age  = 0;
            $cats = DcbdCacheEngine::readCache('categories', $GLOBALS['DCBD_INITIAL_CATEGORIES'], $age);
            array_unshift($cats, $payload);
            DcbdCacheEngine::writeCache('categories', $cats);
            DcbdCacheEngine::forwardToAppsScript('categories/add', $payload, 4);
            $response = ['status' => 'success', 'success' => true, 'data' => $payload];
            break;

        // --- BRANDS ---
        case 'brands/list':
            $age    = 0;
            $brands = DcbdCacheEngine::readCache('brands', [], $age);
            if (empty($brands) || !empty($payload['force'])) {
                $rows = DcbdCacheEngine::fetchGoogleSheetGviz('Brands', '', 4);
                if (is_array($rows) && count($rows) > 0) {
                    $brands = $rows;
                    DcbdCacheEngine::writeCache('brands', $brands);
                } elseif (empty($brands)) {
                    $brands = $GLOBALS['DCBD_INITIAL_BRANDS'];
                }
            }
            $response = ['status' => 'success', 'success' => true, 'data' => ['items' => $brands, 'total' => count($brands)]];
            break;

        // --- ORDERS ---
        case 'orders/create':
        case 'orders/add':
            $orderId = trim((string)($payload['order_id'] ?? $payload['orderId'] ?? ('ORD-' . rand(100000, 999999))));
            $payload['order_id'] = $orderId;
            $payload['OrderID']  = $orderId;
            $payload['date']     = $payload['date'] ?? date('Y-m-d H:i:s');

            // Attach Ad Attribution (Facebook/Instagram/Google/YouTube/TikTok) to Order
            $attr = DcbdPixelTracker::captureAdAttribution();
            if (empty($payload['ad_source']) && (!empty($attr['utm_source']) || !empty($attr['fbclid']) || !empty($attr['gclid']))) {
                $payload['ad_source'] = $attr['utm_source'] ?: (!empty($attr['fbclid']) ? 'facebook_instagram_ads' : (!empty($attr['gclid']) ? 'google_youtube_ads' : 'direct'));
            }

            $age    = 0;
            $orders = DcbdCacheEngine::readCache('orders', [], $age);
            array_unshift($orders, $payload);
            DcbdCacheEngine::writeCache('orders', array_slice($orders, 0, 2000));

            // Also fire Server-Side Meta CAPI Purchase Event automatically
            DcbdPixelTracker::dispatchServerEvent([
                'event_name'  => 'Purchase',
                'event_id'    => 'PUR_' . $orderId,
                'custom_data' => [
                    'order_id'     => $orderId,
                    'value'        => (float)($payload['total_amount'] ?? 0),
                    'currency'     => 'BDT',
                    'content_name' => (string)($payload['products'] ?? 'Order'),
                    'content_type' => 'product',
                ],
                'user_data'   => [
                    'phone' => (string)($payload['phone'] ?? ''),
                    'name'  => (string)($payload['customer_name'] ?? ''),
                ]
            ]);

            // Sync with Google Sheets Apps Script
            DcbdCacheEngine::forwardToAppsScript('orders/create', $payload, 4);
            $response = [
                'status'  => 'success',
                'success' => true,
                'data'    => $payload,
                'message' => 'অর্ডার সফলভাবে লোকাল ডাটাবেজ এবং গুগল শিটে জমা হয়েছে!'
            ];
            break;

        case 'orders/list':
            $age    = 0;
            $orders = DcbdCacheEngine::readCache('orders', [], $age);
            if (empty($orders) || !empty($payload['force'])) {
                $rows = DcbdCacheEngine::fetchGoogleSheetGviz('Orders', '', 5);
                if (is_array($rows) && count($rows) > 0) {
                    $orders = array_reverse($rows);
                    DcbdCacheEngine::writeCache('orders', $orders);
                }
            }
            $response = ['status' => 'success', 'success' => true, 'data' => ['items' => $orders, 'total' => count($orders)]];
            break;

        // --- INCOMPLETE ORDERS (LEAD CAPTURE) ---
        case 'incomplete_orders/create':
        case 'incomplete_orders/add':
            $age  = 0;
            $list = DcbdCacheEngine::readCache('incomplete_orders', [], $age);
            array_unshift($list, $payload);
            DcbdCacheEngine::writeCache('incomplete_orders', array_slice($list, 0, 1000));

            // Fire Server-Side Meta CAPI Lead Event
            DcbdPixelTracker::dispatchServerEvent([
                'event_name'  => 'Lead',
                'custom_data' => [
                    'value'        => (float)($payload['total_amount'] ?? 0),
                    'currency'     => 'BDT',
                    'content_name' => (string)($payload['products'] ?? 'Draft Order'),
                ],
                'user_data'   => [
                    'phone' => (string)($payload['phone'] ?? ''),
                    'name'  => (string)($payload['customer_name'] ?? ''),
                ]
            ]);

            DcbdCacheEngine::forwardToAppsScript('incomplete_orders/create', $payload, 3);
            $response = ['status' => 'success', 'success' => true, 'data' => $payload];
            break;

        // --- SETTINGS & AD PIXEL CONFIGURATION ---
        case 'settings/list':
            $response = ['status' => 'success', 'success' => true, 'data' => DcbdCacheEngine::getSiteSettings()];
            break;

        case 'settings/update':
        case 'settings/save':
        case 'settings/add':
            $current = DcbdCacheEngine::getSiteSettings();
            $merged  = array_merge($current, $payload);
            DcbdCacheEngine::writeCache('settings', $merged);
            DcbdCacheEngine::forwardToAppsScript('settings/save', $payload, 4);
            $response = ['status' => 'success', 'success' => true, 'data' => $merged, 'message' => 'সেটিংস ও পিক্সেল কনফিগারেশন সংরক্ষিত হয়েছে!'];
            break;

        // --- GENERIC COLLECTION SYNC & FALLBACK ---
        default:
            $parts = explode('/', $action);
            $col   = $parts[0] ?? 'general';
            $op    = $parts[1] ?? 'list';

            if ($op === 'list') {
                $age  = 0;
                $rows = DcbdCacheEngine::readCache($col, [], $age);
                if (empty($rows) && isset($GLOBALS['DCBD_SHEET_MAP'][$col])) {
                    $sheetRows = DcbdCacheEngine::fetchGoogleSheetGviz($GLOBALS['DCBD_SHEET_MAP'][$col], '', 4);
                    if (is_array($sheetRows)) {
                        $rows = $sheetRows;
                        DcbdCacheEngine::writeCache($col, $rows);
                    }
                }
                $response = ['status' => 'success', 'success' => true, 'data' => ['items' => $rows, 'total' => count($rows)]];
            } else {
                $asRes = DcbdCacheEngine::forwardToAppsScript($action, $payload, 5);
                $response = is_array($asRes) ? $asRes : ['status' => 'success', 'success' => true, 'data' => $payload];
            }
            break;
    }
} catch (Throwable $e) {
    $response = [
        'status'  => 'error',
        'success' => false,
        'message' => $e->getMessage(),
    ];
}

$callback = isset($_GET['callback']) ? preg_replace('/[^a-zA-Z0-9_.$]/', '', (string)$_GET['callback']) : '';
$jsonOut  = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($callback !== '') {
    header('Content-Type: application/javascript; charset=UTF-8');
    echo $callback . '(' . $jsonOut . ');';
} else {
    echo $jsonOut;
}
