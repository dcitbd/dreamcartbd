<?php
/**
 * DREAM CART BD — OMNI-CHANNEL AD PIXEL, CONVERSIONS API (CAPI) & ATTRIBUTION ENGINE (includes/pixel_tracker.php)
 * Complete Ad Tracking & Landing Optimization for:
 * 1. Facebook & Instagram Ads (Meta Pixel + Meta Conversions API CAPI + Event Deduplication + Catalog Microdata)
 * 2. Google Ads & YouTube Ads (Google Tag gtag.js + Google Ads Conversion Tracking + Enhanced Conversions + GA4)
 * 3. Google Tag Manager (GTM Container + DataLayer E-Commerce Schema)
 * 4. TikTok Ads (TikTok Pixel + Click ID Attribution)
 */

require_once __DIR__ . '/cache_engine.php';

class DcbdPixelTracker {
    /**
     * Capture Ad Click IDs (fbclid, gclid, wbraid, gbraid, ttclid) and UTM parameters on landing
     */
    public static function captureAdAttribution(): array {
        $attribution = [
            'fbclid'       => $_GET['fbclid'] ?? ($_COOKIE['dcbd_fbclid'] ?? ''),
            'gclid'        => $_GET['gclid'] ?? ($_COOKIE['dcbd_gclid'] ?? ''),
            'wbraid'       => $_GET['wbraid'] ?? ($_COOKIE['dcbd_wbraid'] ?? ''),
            'gbraid'       => $_GET['gbraid'] ?? ($_COOKIE['dcbd_gbraid'] ?? ''),
            'ttclid'       => $_GET['ttclid'] ?? ($_COOKIE['dcbd_ttclid'] ?? ''),
            'utm_source'   => $_GET['utm_source'] ?? ($_COOKIE['dcbd_utm_source'] ?? ''),
            'utm_medium'   => $_GET['utm_medium'] ?? ($_COOKIE['dcbd_utm_medium'] ?? ''),
            'utm_campaign' => $_GET['utm_campaign'] ?? ($_COOKIE['dcbd_utm_campaign'] ?? ''),
            'utm_content'  => $_GET['utm_content'] ?? ($_COOKIE['dcbd_utm_content'] ?? ''),
            'utm_term'     => $_GET['utm_term'] ?? ($_COOKIE['dcbd_utm_term'] ?? ''),
            'fbc'          => $_COOKIE['_fbc'] ?? '',
            'fbp'          => $_COOKIE['_fbp'] ?? '',
            'landing_url'  => self::getCurrentUrl(),
            'referrer'     => $_SERVER['HTTP_REFERER'] ?? '',
            'client_ip'    => self::getClientIp(),
            'user_agent'   => $_SERVER['HTTP_USER_AGENT'] ?? '',
        ];

        $cookieExpire = time() + (86400 * 90); // 90 days attribution window
        if (!headers_sent()) {
            foreach (['fbclid', 'gclid', 'wbraid', 'gbraid', 'ttclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as $param) {
                if (!empty($_GET[$param])) {
                    $val = substr(preg_replace('/[^a-zA-Z0-9_\-\.%]/', '', (string)$_GET[$param]), 0, 250);
                    @setcookie('dcbd_' . $param, $val, $cookieExpire, '/', '', is_ssl(), false);
                    $attribution[$param] = $val;
                }
            }

            // Standard Meta _fbc cookie format: fb.1.{timestamp_ms}.{fbclid}
            if (!empty($_GET['fbclid']) && empty($_COOKIE['_fbc'])) {
                $fbc = 'fb.1.' . round(microtime(true) * 1000) . '.' . preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$_GET['fbclid']);
                @setcookie('_fbc', $fbc, $cookieExpire, '/', '', is_ssl(), false);
                $attribution['fbc'] = $fbc;
            }
        }

        return $attribution;
    }

    /**
     * Render Head Ad Pixel & GTM / gtag / Meta / TikTok Scripts
     */
    public static function renderHeadScripts(array $settings, array $seoContext = []): string {
        $attribution = self::captureAdAttribution();
        $fbPixelId   = trim((string)($settings['fbPixelId'] ?? ''));
        $gtagId      = trim((string)($settings['gtagId'] ?? ''));
        $googleAdsId = trim((string)($settings['googleAdsId'] ?? ''));
        $gtmId       = trim((string)($settings['gtmId'] ?? ''));
        $tiktokId    = trim((string)($settings['tiktokPixelId'] ?? ''));
        $ytTrackId   = trim((string)($settings['ytTrackingId'] ?? ''));

        $primaryGoogleTag = $gtagId !== '' ? $gtagId : ($googleAdsId !== '' ? $googleAdsId : $ytTrackId);
        $attrJson = json_encode($attribution, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $pixelConfigJson = json_encode([
            'fbPixelId'             => $fbPixelId,
            'gtagId'                => $gtagId,
            'googleAdsId'           => $googleAdsId,
            'googleConversionLabel' => trim((string)($settings['googleConversionLabel'] ?? '')),
            'gtmId'                 => $gtmId,
            'ytTrackingId'          => $ytTrackId,
            'tiktokPixelId'         => $tiktokId,
            'enableServerCapi'      => (bool)($settings['enableServerCapi'] ?? true),
            'enableEnhancedConv'    => (bool)($settings['enableEnhancedConv'] ?? true),
            'currency'              => 'BDT',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $html = "\n  <!-- Dream Cart BD — Omni-Channel Ad Pixel, Attribution & Conversion Engine (Facebook, Instagram, YouTube, Google, TikTok) -->\n";
        $html .= "  <script>\n";
        $html .= "    window.__DCBD_AD_ATTRIBUTION__ = {$attrJson};\n";
        $html .= "    window.__DCBD_PIXEL_CONFIG__ = {$pixelConfigJson};\n";
        $html .= "    window.dataLayer = window.dataLayer || [];\n";
        $html .= "    function gtag(){window.dataLayer.push(arguments);}\n";
        $html .= "  </script>\n";

        // 1. Google Tag Manager (GTM) if configured
        if ($gtmId !== '') {
            $safeGtm = htmlspecialchars($gtmId, ENT_QUOTES, 'UTF-8');
            $html .= "  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','{$safeGtm}');</script>\n";
        }

        // 2. Google Tag (gtag.js) for Google Ads, YouTube Shopping/Video Ads & Google Analytics 4
        if ($primaryGoogleTag !== '') {
            $safeGtag = htmlspecialchars($primaryGoogleTag, ENT_QUOTES, 'UTF-8');
            $html .= "  <script async src=\"https://www.googletagmanager.com/gtag/js?id={$safeGtag}\"></script>\n";
            $html .= "  <script>\n";
            $html .= "    gtag('js', new Date());\n";
            if ($gtagId !== '') {
                $html .= "    gtag('config', '" . htmlspecialchars($gtagId, ENT_QUOTES, 'UTF-8') . "', { 'allow_enhanced_conversions': true, 'currency': 'BDT' });\n";
            }
            if ($googleAdsId !== '' && $googleAdsId !== $gtagId) {
                $html .= "    gtag('config', '" . htmlspecialchars($googleAdsId, ENT_QUOTES, 'UTF-8') . "', { 'allow_enhanced_conversions': true });\n";
            }
            if ($ytTrackId !== '' && $ytTrackId !== $gtagId && $ytTrackId !== $googleAdsId) {
                $html .= "    gtag('config', '" . htmlspecialchars($ytTrackId, ENT_QUOTES, 'UTF-8') . "', { 'allow_enhanced_conversions': true });\n";
            }
            $html .= "  </script>\n";
        }

        // 3. Facebook & Instagram Meta Pixel (fbevents.js)
        if ($fbPixelId !== '') {
            $safeFb = htmlspecialchars($fbPixelId, ENT_QUOTES, 'UTF-8');
            $html .= "  <script>\n";
            $html .= "    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');\n";
            $html .= "    fbq('init', '{$safeFb}', { country: 'bd' });\n";
            $html .= "  </script>\n";
        }

        // 4. TikTok Pixel (events.js)
        if ($tiktokId !== '') {
            $safeTt = htmlspecialchars($tiktokId, ENT_QUOTES, 'UTF-8');
            $html .= "  <script>\n";
            $html .= "    !function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)}; ttq.load('{$safeTt}'); }(window, document, 'ttq');\n";
            $html .= "  </script>\n";
        }

        return $html;
    }

    /**
     * Render Body <noscript> fallbacks for GTM and Meta Pixel
     */
    public static function renderBodyNoscript(array $settings): string {
        $gtmId     = trim((string)($settings['gtmId'] ?? ''));
        $fbPixelId = trim((string)($settings['fbPixelId'] ?? ''));
        $out = '';
        if ($gtmId !== '') {
            $safeGtm = htmlspecialchars($gtmId, ENT_QUOTES, 'UTF-8');
            $out .= "<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id={$safeGtm}\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>\n";
        }
        if ($fbPixelId !== '') {
            $safeFb = htmlspecialchars($fbPixelId, ENT_QUOTES, 'UTF-8');
            $out .= "<noscript><img height=\"1\" width=\"1\" style=\"display:none\" src=\"https://www.facebook.com/tr?id={$safeFb}&ev=PageView&noscript=1\" alt=\"\" /></noscript>\n";
        }
        return $out;
    }

    /**
     * Dispatch Server-Side Conversion Event (Meta Conversions API CAPI + Local SQLite/JSONL Audit Log)
     */
    public static function dispatchServerEvent(array $payload): array {
        $settings  = DcbdCacheEngine::getSiteSettings();
        $eventName = trim((string)($payload['event_name'] ?? $payload['eventName'] ?? 'PageView'));
        $eventId   = trim((string)($payload['event_id'] ?? $payload['eventId'] ?? ('EVT_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid('', true)), 0, 6))));
        $eventData = is_array($payload['custom_data'] ?? null) ? $payload['custom_data'] : (is_array($payload['data'] ?? null) ? $payload['data'] : $payload);
        $userData  = is_array($payload['user_data'] ?? null) ? $payload['user_data'] : [];

        $clientIp  = self::getClientIp();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $sourceUrl = trim((string)($payload['event_source_url'] ?? $payload['url'] ?? self::getCurrentUrl()));

        // Normalize and SHA-256 hash PII for Meta CAPI & Google Enhanced Conversions
        $rawPhone = preg_replace('/[^0-9]/', '', (string)($userData['phone'] ?? $eventData['phone'] ?? ''));
        if (strlen($rawPhone) === 11 && strpos($rawPhone, '01') === 0) {
            $rawPhone = '88' . $rawPhone;
        }
        $rawEmail = strtolower(trim((string)($userData['email'] ?? $eventData['email'] ?? '')));
        $rawName  = strtolower(trim((string)($userData['name'] ?? $eventData['customer_name'] ?? '')));

        $hashedUser = [
            'client_ip_address' => $clientIp,
            'client_user_agent' => $userAgent,
            'country'           => [hash('sha256', 'bd')],
        ];
        if ($rawPhone !== '') {
            $hashedUser['ph'] = [hash('sha256', $rawPhone)];
        }
        if ($rawEmail !== '') {
            $hashedUser['em'] = [hash('sha256', $rawEmail)];
        }
        if ($rawName !== '') {
            $hashedUser['fn'] = [hash('sha256', $rawName)];
        }
        $fbc = $payload['fbc'] ?? ($_COOKIE['_fbc'] ?? '');
        $fbp = $payload['fbp'] ?? ($_COOKIE['_fbp'] ?? '');
        if ($fbc !== '') $hashedUser['fbc'] = $fbc;
        if ($fbp !== '') $hashedUser['fbp'] = $fbp;

        // Log event locally in SQLite for analytics & verification
        $db = DcbdCacheEngine::getDb();
        if ($db) {
            try {
                $stmt = $db->prepare('INSERT INTO ad_events_log (event_id, event_name, platform, payload, ip_address, user_agent, created_at) VALUES (:eid, :en, :pl, :py, :ip, :ua, :dt)');
                if ($stmt) {
                    $stmt->execute([
                        ':eid' => $eventId,
                        ':en'  => $eventName,
                        ':pl'  => 'meta_google_tiktok_capi',
                        ':py'  => json_encode($eventData, JSON_UNESCAPED_UNICODE),
                        ':ip'  => $clientIp,
                        ':ua'  => substr($userAgent, 0, 250),
                        ':dt'  => date('Y-m-d H:i:s'),
                    ]);
                }
            } catch (Throwable $e) {}
        }

        // Send to Meta Conversions API (CAPI) if fbPixelId and fbCapiToken are configured
        $fbPixelId   = trim((string)($settings['fbPixelId'] ?? ''));
        $fbCapiToken = trim((string)($settings['fbCapiToken'] ?? ''));
        $fbTestCode  = trim((string)($settings['fbTestEventCode'] ?? ''));
        $capiStatus  = 'logged_local';

        if ($fbPixelId !== '' && $fbCapiToken !== '') {
            $capiPayload = [
                'data' => [
                    [
                        'event_name'       => $eventName,
                        'event_time'       => time(),
                        'event_id'         => $eventId,
                        'action_source'    => 'website',
                        'event_source_url' => $sourceUrl,
                        'user_data'        => $hashedUser,
                        'custom_data'      => [
                            'currency'     => $eventData['currency'] ?? 'BDT',
                            'value'        => (float)($eventData['value'] ?? $eventData['total_amount'] ?? 0),
                            'content_ids'  => $eventData['content_ids'] ?? [$eventData['sku'] ?? $eventData['order_id'] ?? 'DCBD-ITEM'],
                            'content_type' => $eventData['content_type'] ?? 'product',
                            'content_name' => $eventData['content_name'] ?? ($eventData['name'] ?? 'Dream Cart BD Product'),
                            'order_id'     => $eventData['order_id'] ?? ($eventData['orderId'] ?? ''),
                        ],
                    ]
                ]
            ];
            if ($fbTestCode !== '') {
                $capiPayload['test_event_code'] = $fbTestCode;
            }
            $capiUrl = 'https://graph.facebook.com/v19.0/' . rawurlencode($fbPixelId) . '/events?access_token=' . rawurlencode($fbCapiToken);
            DcbdCacheEngine::httpPostJson($capiUrl, $capiPayload, 3, ['Content-Type: application/json']);
            $capiStatus = 'sent_to_meta_capi';
        }

        return [
            'success'     => true,
            'status'      => 'success',
            'event_id'    => $eventId,
            'event_name'  => $eventName,
            'capi_status' => $capiStatus,
        ];
    }

    public static function getClientIp(): string {
        foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $k) {
            if (!empty($_SERVER[$k])) {
                $parts = explode(',', (string)$_SERVER[$k]);
                return trim($parts[0]);
            }
        }
        return '127.0.0.1';
    }

    public static function getCurrentUrl(): string {
        $scheme = is_ssl() ? 'https' : 'http';
        $host   = $_SERVER['HTTP_HOST'] ?? 'dreamcartbd.com';
        $uri    = $_SERVER['REQUEST_URI'] ?? '/';
        return $scheme . '://' . $host . $uri;
    }
}

function is_ssl(): bool {
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
        return true;
    }
    return isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443;
}
