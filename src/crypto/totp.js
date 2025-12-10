// src/crypto/totp.js
import { authenticator } from 'otplib';

// Configure TOTP
authenticator.options = {
  step: 30,
  digits: 6,
  algorithm: 'sha1',  
  window: 1           
};

// RFC 4648 base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function bytesToBase32(buffer) {
  let bits = '';
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0');
  }

  let base32 = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5);
    const padded = chunk.padEnd(5, '0');
    base32 += BASE32_ALPHABET[parseInt(padded, 2)];
  }

  return base32;
}

export function hexSeedToBase32(hexSeed) {
  if (typeof hexSeed !== 'string' || hexSeed.length !== 64) {
    throw new Error('Seed must be a 64-character hex string');
  }
  if (!/^[0-9a-f]+$/.test(hexSeed)) {
    throw new Error('Seed must contain only lowercase hex characters (0-9a-f)');
  }
  const buf = Buffer.from(hexSeed, 'hex');
  return bytesToBase32(buf);
}

/**
 * Generate current TOTP code.
 */
export function generateTotpCode(hexSeed) {
  const base32Secret = hexSeedToBase32(hexSeed);
  return authenticator.generate(base32Secret);
}

/**
 * Verify TOTP code with ±validWindow periods (default 1).
 */
export function verifyTotpCode(hexSeed, code, validWindow = 1) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return false;
  }

  const base32Secret = hexSeedToBase32(hexSeed);

  // Set window dynamically (±validWindow steps)
  authenticator.options = {
    ...authenticator.options,
    window: validWindow
  };

  return authenticator.check(code, base32Secret);
}

/**
 * Seconds remaining in current 30-second period.
 */
export function getSecondsRemainingInWindow() {
  const now = Math.floor(Date.now() / 1000);
  const step = 30;
  const elapsed = now % step;
  return step - elapsed;
}
