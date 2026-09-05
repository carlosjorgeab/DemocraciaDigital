/**
 * Cryptographic utilities for password hashing and session token verification.
 * Built with standard Web Crypto API (compatible with Node.js and Edge Runtime).
 */

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'democracia-digital-secret-key-fallback-min-32-chars';
const PBKDF2_ITERATIONS = 100000;

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function base64UrlEncode(str: string): string {
  const base64 = typeof Buffer !== 'undefined'
    ? Buffer.from(str).toString('base64')
    : btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return typeof Buffer !== 'undefined'
    ? Buffer.from(base64, 'base64').toString('utf8')
    : decodeURIComponent(escape(atob(base64)));
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generates a secure PBKDF2 hash for a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = bufferToHex(salt.buffer);

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashHex = bufferToHex(derivedBits);
  return `pbkdf2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Verifies a password against a stored hash or plaintext legacy password
 */
export async function verifyPassword(password: string, storedHash: string): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (!storedHash) {
    return { valid: false, needsRehash: false };
  }

  // Check for PBKDF2 format
  if (storedHash.startsWith('pbkdf2:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 4) return { valid: false, needsRehash: false };

    const iterations = parseInt(parts[1], 10);
    const salt = hexToBuffer(parts[2]);
    const expectedHash = parts[3];

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const actualHash = bufferToHex(derivedBits);
    const valid = constantTimeEqual(actualHash, expectedHash);
    return { valid, needsRehash: false };
  }

  // Legacy plaintext fallback check
  const isPlaintextMatch = constantTimeEqual(password, storedHash);
  return {
    valid: isPlaintextMatch,
    needsRehash: isPlaintextMatch, // Flag that password should be upgraded to PBKDF2
  };
}

/**
 * Creates an HMAC-SHA256 signed session token
 */
export async function createSessionToken(payload: Record<string, any>, expiresInSeconds: number = 7 * 24 * 3600): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encHeader}.${encPayload}`;

  const enc = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', secretKey, enc.encode(dataToSign));
  const encSignature = base64UrlEncode(bufferToHex(signature));

  return `${dataToSign}.${encSignature}`;
}

/**
 * Verifies an HMAC-SHA256 session token
 */
export async function verifySessionToken<T = any>(token?: string | null): Promise<T | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encHeader, encPayload, encSignature] = parts;
  const dataToVerify = `${encHeader}.${encPayload}`;

  try {
    const enc = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const expectedSig = await crypto.subtle.sign('HMAC', secretKey, enc.encode(dataToVerify));
    const expectedSigHex = bufferToHex(expectedSig);
    const actualSigHex = base64UrlDecode(encSignature);

    if (!constantTimeEqual(expectedSigHex, actualSigHex)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload as T;
  } catch {
    return null;
  }
}
