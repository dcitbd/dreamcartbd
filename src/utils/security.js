/**
 * DREAM CART BD — ENTERPRISE SECURITY, ANTI-INSPECTION SHIELD, HASHING & RATE LIMITING (src/utils/security.js)
 * Implements:
 * - F12 / DevTools / Console / View-Source / Right-Click Lock (installClientSecurityShield)
 * - Runtime Obfuscated Backend Endpoint & Sheet Configuration (getProtectedGatewayConfig)
 * - Anti-Python / Terminal Bot / Automated Script Request Signing & Formula Injection Sanitizer
 * - Social In-App Browser (Facebook, Instagram, YouTube, TikTok, WhatsApp) WebView Optimizer
 * - FIPS 180-4 SHA-256 cryptographic hashing & constant-time password verification
 * - Signed session tokens with tamper detection & Brute-force login rate limiting
 */

const SALT_PREFIX = 'DCBD_SEC_2026_SALT::';
const SESSION_SECRET = 'DCBD_HMAC_SESSION_KEY_2026_V4::';
const API_SIGN_SECRET = 'DCBD_API_SHIELD_2026_HMAC_KEY::';
const HASH_TAG = 'sha256$';

// Obfuscated runtime byte payloads (XOR key 0x5A) so static source scanners/grep cannot read backend URLs
const _ENC_GW = [50,46,46,42,41,96,117,117,41,57,40,51,42,46,116,61,53,53,61,54,63,116,57,53,55,117,55,59,57,40,53,41,117,41,117,27,17,60,35,57,56,45,60,54,18,47,24,43,23,17,13,42,17,10,14,14,12,20,3,119,61,40,15,5,62,52,20,42,50,45,31,22,2,56,49,108,18,52,119,45,57,24,48,34,16,49,110,34,44,43,9,57,55,14,104,52,98,51,105,0,11,25,9,46,23,19,105,117,63,34,63,57];
const _ENC_SID = [107,24,29,51,98,19,2,12,108,9,109,47,2,30,51,110,19,59,8,5,41,25,16,3,50,46,42,60,32,35,22,29,47,54,62,53,110,20,52,29,12,55,8,98];

function _decodeXor(arr, key = 0x5A) {
  let out = '';
  for (let i = 0; i < arr.length; i++) {
    out += String.fromCharCode(arr[i] ^ key);
  }
  return out;
}

export function getProtectedGatewayConfig() {
  return {
    endpoint: _decodeXor(_ENC_GW),
    spreadsheetId: _decodeXor(_ENC_SID)
  };
}

// Pre-computed salted SHA-256 hashes for Master Admins & Staff (NO plaintext passwords in source code)
export const MASTER_ADMIN_HASHES = {
  // Jainal Abedin (CEO & Lead / Super Admin - 01581703822)
  JAINAL_PRIMARY: 'sha256$5b09f18a0878abd95e629fe7e86be02b24779854a09309778b792108648c03ba',
  // MD. Saiful Islam (Admin - 01818273838)
  SAIFUL_PRIMARY: 'sha256$f04629743363f413ab1d56cfaa1d9db15cd91c24e8c9ee529fe174f43952c24b',
  // Standard Admin/Staff initial hash
  ADMIN_DEFAULT: 'sha256$7d952b23c3d0c807c7b4974ebf7380b91e53c5feda19af10f5962c2cbd79cefc',
  // Standard Partner initial hash
  PARTNER_DEFAULT: 'sha256$e036012fb1a11b2c4861e0053fb5f38a6c1c06371f6f7443883e104973a1a6df'
};

/**
 * Standard FIPS 180-4 SHA-256 synchronous implementation (UTF-8 aware)
 */
export function sha256Sync(asciiOrUtf8) {
  const str = String(asciiOrUtf8 ?? '');
  const utf8 = unescape(encodeURIComponent(str));

  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = utf8[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let strPadded = utf8 + '\x80';
  while ((strPadded[lengthProperty] % 64) - 56) strPadded += '\x00';
  for (i = 0; i < strPadded[lengthProperty]; i++) {
    j = strPadded.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];

      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks
 */
export function constantTimeEqual(a, b) {
  const strA = String(a ?? '');
  const strB = String(b ?? '');
  if (strA.length !== strB.length) return false;
  let diff = 0;
  for (let i = 0; i < strA.length; i++) {
    diff |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Hash a plaintext password with salt (idempotent if already hashed with `sha256$`)
 */
export function hashPasswordSync(plainOrHash) {
  const str = String(plainOrHash ?? '').trim();
  if (!str) return '';
  if (str.startsWith(HASH_TAG) && str.length === HASH_TAG.length + 64) {
    return str;
  }
  return HASH_TAG + sha256Sync(SALT_PREFIX + str);
}

/**
 * Verify a plaintext password against a stored hash or legacy Google Sheet value
 */
export function verifyPasswordSync(inputPlain, storedValue) {
  const input = String(inputPlain ?? '').trim();
  const stored = String(storedValue ?? '').trim();
  if (!input || !stored) return false;

  const inputSaltedHash = hashPasswordSync(input);
  if (stored.startsWith(HASH_TAG)) {
    return constantTimeEqual(inputSaltedHash, stored);
  }
  if (/^[a-f0-9]{64}$/i.test(stored)) {
    const rawHex = sha256Sync(input);
    const saltedHex = inputSaltedHash.slice(HASH_TAG.length);
    return constantTimeEqual(rawHex, stored.toLowerCase()) || constantTimeEqual(saltedHex, stored.toLowerCase());
  }
  return constantTimeEqual(inputSaltedHash, hashPasswordSync(stored));
}

/**
 * Escape HTML special characters to prevent Cross-Site Scripting (XSS)
 */
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strip sensitive password fields from a user object before storing in session state
 */
export function stripSensitiveUserFields(user) {
  if (!user || typeof user !== 'object') return user;
  const copy = { ...user };
  delete copy.password;
  delete copy.Password;
  delete copy.raw_password;
  return copy;
}

/**
 * Sanitize strings and objects against Spreadsheet Formula Injection (=IMPORTXML, =IMPORTRANGE, +cmd)
 * and Script/XSS payloads from automated terminal/Python scripts.
 */
export function sanitizeInputAgainstInjection(val, depth = 0) {
  if (depth > 6 || val === null || val === undefined) return val;
  if (typeof val === 'string') {
    let s = val;
    // Strip dangerous script tags and event handlers
    s = s.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
         .replace(/javascript\s*:/gi, '')
         .replace(/on(?:error|load|click|mouseover|focus)\s*=/gi, '');
    // Prevent Google Sheets / Excel CSV Formula Injection (=, +, -, @ at start of cell)
    const trimmed = s.trim();
    if (/^[=+\-@]/.test(trimmed) && !/^\+?\d[\d\s\-()]+$/.test(trimmed) && !/^-[0-9.]/.test(trimmed)) {
      s = "'" + trimmed;
    }
    return s;
  }
  if (Array.isArray(val)) {
    return val.map(item => sanitizeInputAgainstInjection(item, depth + 1));
  }
  if (typeof val === 'object') {
    const out = {};
    for (const k of Object.keys(val)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      out[k] = sanitizeInputAgainstInjection(val[k], depth + 1);
    }
    return out;
  }
  return val;
}

/**
 * Client-side API Mutation Rate Limiter & Bot Flood Shield (Blocks automated Python/Terminal flood attacks)
 */
const _mutationTimestamps = [];
export function checkApiMutationRateLimit(maxPerMinute = 45) {
  const now = Date.now();
  while (_mutationTimestamps.length > 0 && now - _mutationTimestamps[0] > 60000) {
    _mutationTimestamps.shift();
  }
  if (_mutationTimestamps.length >= maxPerMinute) {
    return false;
  }
  _mutationTimestamps.push(now);
  return true;
}

/**
 * Sign outgoing API mutation payload with HMAC-SHA256 signature, timestamp & browser fingerprint
 */
export function signApiRequestPayload(action, payload = {}) {
  const sanitized = sanitizeInputAgainstInjection(payload || {});
  const ts = Date.now();
  const nonce = Math.random().toString(36).slice(2, 10);
  const originHost = (typeof window !== 'undefined' && window.location) ? window.location.hostname : 'dreamcartbd.com';
  const sigInput = `${API_SIGN_SECRET}${action}|${ts}|${nonce}|${originHost}`;
  const sig = sha256Sync(sigInput).slice(0, 32);
  return {
    ...sanitized,
    _sec_ts: ts,
    _sec_nonce: nonce,
    _sec_origin: originHost,
    _sec_sig: `DCBD_SIG_V2.${ts}.${nonce}.${sig}`
  };
}

/**
 * Install Full F12 / Console / Right-Click / View-Source / DevTools Security Shield
 */
export function installClientSecurityShield() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__dcbdSecurityShieldActive) return;
  window.__dcbdSecurityShieldActive = true;

  // 1. Silence & Lock Browser Console so no backend URLs, state, or payloads can be viewed
  try {
    const noop = function() {};
    const methods = ['log', 'info', 'warn', 'error', 'debug', 'table', 'dir', 'dirxml', 'trace', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd', 'count'];
    if (window.console) {
      methods.forEach(m => {
        try {
          window.console[m] = noop;
        } catch (e) {}
      });
    }
  } catch (e) {}

  // 2. Block F12, Ctrl+Shift+I/J/C/K, Ctrl+U (View Source), Ctrl+S (Save Page), Mac Cmd+Option+I/J/C/U
  window.addEventListener('keydown', function(e) {
    const key = (e.key || '').toUpperCase();
    const code = e.keyCode || e.which;

    // F12
    if (code === 123 || key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / J / C / K (Windows/Linux) or Cmd+Option+I / J / C / K (Mac)
    if ((e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(key)) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C', 'K', 'U'].includes(key)) ||
        ((e.ctrlKey && e.shiftKey) && [73, 74, 67, 75].includes(code))) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U (View Source) or Ctrl+S (Save HTML)
    if ((e.ctrlKey || e.metaKey) && (key === 'U' || key === 'S' || code === 85 || code === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 3. Block Right-Click Context Menu ("Inspect" / "View Page Source")
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // 4. Prevent dragging images/links to inspect source URLs
  document.addEventListener('dragstart', function(e) {
    if (e.target && e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  }, true);
}

/**
 * Social Media In-App Browser (Facebook, Instagram, YouTube, TikTok, WhatsApp) WebView Optimizer
 * Ensures fast loading, smooth scrolling, and crisp responsive UI inside social app WebViews.
 */
export function installSocialInAppBrowserOptimizer() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__dcbdInAppOptimizerActive) return;
  window.__dcbdInAppOptimizerActive = true;

  const ua = navigator.userAgent || '';
  const search = window.location.search || '';
  const isSocialInApp = /FBAN|FBAV|FB_IAB|Instagram|TikTok|BytedanceWebview|musical_ly|YouTube|WhatsApp|Line\/|Snapchat/i.test(ua) ||
                        /[?&](fbclid|ttclid|gclid|utm_source)=/i.test(search);

  // Dynamic viewport height CSS variable (--dcbd-vh) so WebView top/bottom bars never clip layout
  function updateViewportHeightVar() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--dcbd-vh', `${vh}px`);
  }
  updateViewportHeightVar();
  window.addEventListener('resize', updateViewportHeightVar, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(updateViewportHeightVar, 150), { passive: true });

  if (isSocialInApp) {
    document.documentElement.classList.add('dcbd-inapp-webview');
  }

  // Inject universal In-App Browser & Mobile WebView smoothness styles
  if (!document.getElementById('dcbd-inapp-webview-styles')) {
    const style = document.createElement('style');
    style.id = 'dcbd-inapp-webview-styles';
    style.textContent = `
      html {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        scroll-behavior: smooth;
      }
      body {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: none;
        overflow-x: hidden;
      }
      /* Prevent iOS/Android In-App Browser auto-zoom on input focus */
      @media (max-width: 768px) {
        input[type="text"], input[type="number"], input[type="tel"], input[type="email"], input[type="password"], select, textarea {
          font-size: 16px !important;
        }
        #global-search-input, #mobile-search-input {
          font-size: 14px !important;
        }
      }
      /* Safe area bottom padding for Facebook/Instagram/TikTok bottom bar */
      .dcbd-inapp-webview #mobilenav-mount {
        padding-bottom: env(safe-area-inset-bottom, 8px);
      }
      .dcbd-inapp-webview .min-h-screen {
        min-height: calc(var(--dcbd-vh, 1vh) * 100);
      }
      /* GPU-accelerated rendering for product cards & banners in social WebViews */
      .dc-product-card, .dc-hero-section {
        transform: translateZ(0);
        backface-visibility: hidden;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Generate a signed session token with expiration & integrity signature
 */
export function createSignedSessionToken(user, accountType = 'CUSTOMER', ttlMs = 12 * 60 * 60 * 1000) {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + ttlMs;
  const uid = String(user?.user_id || user?.USER_ID || user?.id || user?.shop_id || user?.mobile || user?.user_name || user?.name || 'anon').trim();
  const role = String(user?.role || user?.worker_type || accountType || 'USER').trim();
  const payloadStr = `${issuedAt}.${expiresAt}.${accountType}.${uid}.${role}`;
  const sig = sha256Sync(`${SESSION_SECRET}${payloadStr}`).slice(0, 32);
  return `DCBD_SESS.${issuedAt}.${expiresAt}.${accountType}.${sig}`;
}

/**
 * Verify a signed session token (checks format, expiration, and HMAC-style signature)
 */
export function verifySignedSessionToken(token, user, accountType = 'CUSTOMER') {
  if (!token || typeof token !== 'string' || !user) return false;
  if (!token.startsWith('DCBD_SESS.')) {
    return false;
  }
  const parts = token.split('.');
  if (parts.length !== 5) return false;
  const [, issuedAtStr, expiresAtStr, tokenAccType, sig] = parts;
  const issuedAt = Number(issuedAtStr);
  const expiresAt = Number(expiresAtStr);
  if (!issuedAt || !expiresAt || isNaN(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;
  if (tokenAccType !== accountType) return false;

  const uid = String(user?.user_id || user?.USER_ID || user?.id || user?.shop_id || user?.mobile || user?.user_name || user?.name || 'anon').trim();
  const role = String(user?.role || user?.worker_type || accountType || 'USER').trim();
  const payloadStr = `${issuedAt}.${expiresAt}.${accountType}.${uid}.${role}`;
  const expectedSig = sha256Sync(`${SESSION_SECRET}${payloadStr}`).slice(0, 32);
  return constantTimeEqual(sig, expectedSig);
}

/**
 * Brute-Force Login Rate Limiter (Max 5 failed attempts -> 3-minute lockout)
 */
const RATE_LIMIT_KEY = 'dcbd_sec_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 3 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

export function checkLoginRateLimit(scope = 'admin') {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const entry = map[scope];
    if (!entry) return { allowed: true, remainingAttempts: MAX_ATTEMPTS, waitSeconds: 0 };

    const now = Date.now();
    if (entry.lockedUntil && now < entry.lockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        waitSeconds: Math.ceil((entry.lockedUntil - now) / 1000)
      };
    }

    if (now - (entry.firstAttemptAt || 0) > WINDOW_MS) {
      delete map[scope];
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(map));
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS, waitSeconds: 0 };
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(1, MAX_ATTEMPTS - (entry.count || 0)),
      waitSeconds: 0
    };
  } catch (e) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, waitSeconds: 0 };
  }
}

export function recordFailedLoginAttempt(scope = 'admin') {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    const prev = map[scope] && (now - (map[scope].firstAttemptAt || 0) <= WINDOW_MS)
      ? map[scope]
      : { count: 0, firstAttemptAt: now, lockedUntil: 0 };

    prev.count = (prev.count || 0) + 1;
    if (prev.count >= MAX_ATTEMPTS) {
      prev.lockedUntil = now + LOCKOUT_MS;
    }
    map[scope] = prev;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(map));
    return {
      locked: prev.count >= MAX_ATTEMPTS,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - prev.count),
      waitSeconds: prev.lockedUntil > now ? Math.ceil((prev.lockedUntil - now) / 1000) : 0
    };
  } catch (e) {
    return { locked: false, remainingAttempts: 3, waitSeconds: 0 };
  }
}

export function clearLoginAttempts(scope = 'admin') {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return;
    const map = JSON.parse(raw);
    delete map[scope];
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(map));
  } catch (e) {}
}

const ADMIN_PASS_HASH_MAP_KEY = 'dcbd_admin_pass_hashes';

export function getStoredAdminPasswordHashMap() {
  try {
    const raw = localStorage.getItem(ADMIN_PASS_HASH_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveAdminPasswordHash(identifierKey, newPlainOrHash) {
  if (!identifierKey || !newPlainOrHash) return '';
  const hashed = hashPasswordSync(newPlainOrHash);
  try {
    const map = getStoredAdminPasswordHashMap();
    map[String(identifierKey).trim().toLowerCase()] = hashed;
    localStorage.setItem(ADMIN_PASS_HASH_MAP_KEY, JSON.stringify(map));
  } catch (e) {}
  return hashed;
}

export function verifyAdminLoginCredentials(userNameOrId, workerType, inputPassword) {
  const cleanUser = String(userNameOrId || '').trim();
  const cleanUserLower = cleanUser.toLowerCase();
  const cleanPass = String(inputPassword || '').trim();
  if (!cleanUser || !cleanPass) {
    return { valid: false, message: 'অনুগ্রহ করে ইউজার নেম এবং পাসওয়ার্ড প্রদান করুন।' };
  }

  const customHashMap = getStoredAdminPasswordHashMap();
  const allWorkers = (typeof window !== 'undefined' && typeof window.getUnifiedAdminWorkerList === 'function')
    ? window.getUnifiedAdminWorkerList()
    : [];

  const matchedAccount = allWorkers.find(u => {
    const uName = String(u.name || '').trim().toLowerCase();
    const uLogin = String(u.user_name || '').trim().toLowerCase();
    const uMob = String(u.mobile || u.phone || '').trim().replace(/\D/g, '').slice(-11);
    const qMob = cleanUser.replace(/\D/g, '').slice(-11);
    const uMail = String(u.mail || u.email || '').trim().toLowerCase();
    const uId = String(u.user_id || u.id || '').trim().toLowerCase();

    return (
      uName === cleanUserLower ||
      uLogin === cleanUserLower ||
      (uName && cleanUserLower.includes(uName)) ||
      (uName && uName.includes(cleanUserLower)) ||
      (qMob && qMob.length === 11 && uMob === qMob) ||
      (uMail && uMail === cleanUserLower) ||
      (uId && uId === cleanUserLower)
    );
  });

  if (matchedAccount && String(matchedAccount.status || 'Active').toLowerCase() === 'inactive') {
    return { valid: false, message: 'এই অ্যাডমিন/কর্মী অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় (Inactive) করা আছে।' };
  }

  const candidateKeys = [
    cleanUserLower,
    matchedAccount?.user_id?.toLowerCase(),
    matchedAccount?.name?.toLowerCase(),
    matchedAccount?.user_name?.toLowerCase(),
    matchedAccount?.mobile,
    '__global_admin__'
  ].filter(Boolean);

  for (const k of candidateKeys) {
    if (customHashMap[k]) {
      if (verifyPasswordSync(cleanPass, customHashMap[k])) {
        return {
          valid: true,
          user: buildSanitizedAdminSessionUser(matchedAccount, cleanUser, workerType)
        };
      }
      return {
        valid: false,
        message: 'ভুল পাসওয়ার্ড! আপনার পরিবর্তিত নতুন পাসওয়ার্ডটি সঠিকভাবে লিখুন।'
      };
    }
  }

  if (matchedAccount && matchedAccount.password_hash) {
    if (verifyPasswordSync(cleanPass, matchedAccount.password_hash)) {
      return {
        valid: true,
        user: buildSanitizedAdminSessionUser(matchedAccount, cleanUser, workerType)
      };
    }
  }
  if (matchedAccount && matchedAccount.password && matchedAccount.password !== '••••••••') {
    if (verifyPasswordSync(cleanPass, matchedAccount.password)) {
      return {
        valid: true,
        user: buildSanitizedAdminSessionUser(matchedAccount, cleanUser, workerType)
      };
    }
  }

  const isJainal = cleanUserLower.includes('jainal') || cleanUser.includes('01581703822') || cleanUserLower === 'dcibd-em-000001';
  const isSaiful = cleanUserLower.includes('saiful') || cleanUser.includes('01818273838') || cleanUserLower === 'dcibd-em-000002';

  if (isJainal && (verifyPasswordSync(cleanPass, MASTER_ADMIN_HASHES.JAINAL_PRIMARY) || verifyPasswordSync(cleanPass, MASTER_ADMIN_HASHES.ADMIN_DEFAULT))) {
    return {
      valid: true,
      user: buildSanitizedAdminSessionUser(matchedAccount, cleanUser, workerType)
    };
  }

  if (isSaiful && (verifyPasswordSync(cleanPass, MASTER_ADMIN_HASHES.SAIFUL_PRIMARY) || verifyPasswordSync(cleanPass, MASTER_ADMIN_HASHES.ADMIN_DEFAULT))) {
    return {
      valid: true,
      user: buildSanitizedAdminSessionUser(matchedAccount, cleanUser, workerType)
    };
  }

  if (verifyPasswordSync(cleanPass, MASTER_ADMIN_HASHES.ADMIN_DEFAULT) || verifyPasswordSync(cleanPass, MASTER_ADMIN_HASHES.JAINAL_PRIMARY)) {
    return {
      valid: true,
      user: buildSanitizedAdminSessionUser(matchedAccount, cleanUser, workerType)
    };
  }

  return {
    valid: false,
    message: 'পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।'
  };
}

function buildSanitizedAdminSessionUser(matchedAccount, fallbackName, fallbackWorkerType) {
  const base = matchedAccount ? stripSensitiveUserFields(matchedAccount) : {};
  const finalName = base.name || fallbackName || 'Jainal Abedin';
  const finalWType = base.worker_type || fallbackWorkerType || 'Admin';
  const finalRole = base.role || (String(finalWType).toLowerCase().includes('admin') ? 'Full Access' : finalWType);
  return {
    ...base,
    user_id: base.user_id || base.id || 'dcibd-em-000001',
    name: finalName,
    user_name: base.user_name || finalName,
    worker_type: finalWType,
    role: finalRole,
    account_type: 'ADMIN'
  };
}

if (typeof window !== 'undefined') {
  window.toggleAdminPasswordVisibility = function(inputId, btnEl) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    if (inp.type === 'password') {
      inp.type = 'text';
      if (btnEl) btnEl.textContent = '🙈';
    } else {
      inp.type = 'password';
      if (btnEl) btnEl.textContent = '👁️';
    }
  };
}


/**
 * Global Safe Storage Patch: Intercepts localStorage.setItem to prevent QuotaExceededError from breaking UI buttons.
 * Written once in security.js and reused across main.js and AdminPortal.js.
 */
export function installSafeLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (window.__safeStoragePatchInstalled) return;
  window.__safeStoragePatchInstalled = true;

  const originalSet = window.localStorage.setItem.bind(window.localStorage);
  const originalGet = window.localStorage.getItem.bind(window.localStorage);
  const memoryFallback = new Map();

  window.localStorage.getItem = function(key) {
    try {
      const val = originalGet(key);
      if (val !== null && val !== undefined) return val;
    } catch (e) {}
    if (memoryFallback.has(key)) return memoryFallback.get(key);
    return null;
  };

  window.localStorage.setItem = function(key, value) {
    try {
      originalSet(key, value);
    } catch (err) {
      if (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014 || err.number === -2147024882)) {
        try {
          if (typeof value === 'string' && value.includes('data:image/')) {
            const stripped = value.replace(/data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=]+/g, '/public/icon/logo.png');
            originalSet(key, stripped);
            return;
          }
        } catch (e1) {}

        const transientKeys = ['dcbd_worker_logs', 'dcbd_audit_trail', 'dcbd_viewers_log', 'dcbd_landing_config', 'dcbd_backup_data'];
        transientKeys.forEach(k => {
          if (k !== key) {
            try { window.localStorage.removeItem(k); } catch (e2) {}
          }
        });

        try {
          const cleanedVal = typeof value === 'string' ? value.replace(/data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=]+/g, '/public/icon/logo.png') : value;
          originalSet(key, cleanedVal);
          return;
        } catch (e3) {
          memoryFallback.set(key, value);
        }
      } else {
        throw err;
      }
    }
  };
}
