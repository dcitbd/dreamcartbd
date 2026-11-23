<?php
/**
 * Dream Cart BD — Secret Encryption & Masking Utility (tracking/crypto.php)
 * Uses OpenSSL AES-256-GCM authenticated encryption for server-side credential storage.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

class DcbdTrackingCrypto {
    private static function getKey(): string {
        $envKey = dcbd_trk_env('DCBD_TRK_APP_KEY', '');
        if ($envKey !== '' && $envKey !== 'CHANGE_ME_TO_A_64_CHAR_RANDOM_HEX_SECRET') {
            return hash('sha256', $envKey, true);
        }

        // Auto-generate a local protected key file in storage/ (excluded from Git & web access)
        $keyFile = DCBD_TRK_STORAGE_DIR . '/.trk_master.key';
        if (is_file($keyFile) && is_readable($keyFile)) {
            $raw = trim((string)@file_get_contents($keyFile));
            if (strlen($raw) >= 32) {
                return hash('sha256', $raw, true);
            }
        }

        $generated = bin2hex(random_bytes(32));
        @file_put_contents($keyFile, $generated, LOCK_EX);
        @chmod($keyFile, 0600);
        return hash('sha256', $generated, true);
    }

    public static function encrypt(string $plaintext): string {
        if ($plaintext === '') return '';
        $key = self::getKey();
        if (function_exists('openssl_encrypt') && in_array('aes-256-gcm', openssl_get_cipher_methods(), true)) {
            $iv = random_bytes(12);
            $tag = '';
            $cipher = openssl_encrypt($plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, 'dcbd_trk_v1');
            if ($cipher !== false) {
                return 'v1:gcm:' . base64_encode($iv . $tag . $cipher);
            }
        }
        // Fallback: AES-256-CBC + HMAC-SHA256
        $iv = random_bytes(16);
        $cipher = openssl_encrypt($plaintext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        $mac = hash_hmac('sha256', $iv . $cipher, $key, true);
        return 'v1:cbc:' . base64_encode($iv . $mac . $cipher);
    }

    public static function decrypt(string $encoded): string {
        if ($encoded === '') return '';
        $key = self::getKey();
        if (str_starts_with($encoded, 'v1:gcm:')) {
            $raw = base64_decode(substr($encoded, 7), true);
            if ($raw === false || strlen($raw) < 28) return '';
            $iv = substr($raw, 0, 12);
            $tag = substr($raw, 12, 16);
            $cipher = substr($raw, 28);
            $plain = openssl_decrypt($cipher, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, 'dcbd_trk_v1');
            return $plain === false ? '' : $plain;
        }
        if (str_starts_with($encoded, 'v1:cbc:')) {
            $raw = base64_decode(substr($encoded, 7), true);
            if ($raw === false || strlen($raw) < 48) return '';
            $iv = substr($raw, 0, 16);
            $mac = substr($raw, 16, 32);
            $cipher = substr($raw, 48);
            $calc = hash_hmac('sha256', $iv . $cipher, $key, true);
            if (!hash_equals($mac, $calc)) return '';
            $plain = openssl_decrypt($cipher, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
            return $plain === false ? '' : $plain;
        }
        return '';
    }

    /**
     * Strictly mask a secret for UI display (never reveals full token)
     */
    public static function mask(string $secret): string {
        $len = strlen($secret);
        if ($len === 0) return '';
        if ($len <= 8) return str_repeat('•', $len);
        return substr($secret, 0, 4) . str_repeat('•', min(16, $len - 8)) . substr($secret, -4);
    }
}
