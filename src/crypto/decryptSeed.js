// src/crypto/decryptSeed.js
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const { RSA_PKCS1_OAEP_PADDING } = crypto.constants;

function loadPrivateKey() {
  const keyPath = process.env.STUDENT_PRIVATE_KEY_PATH || path.join(process.cwd(), 'student_private.pem');
  return fs.readFileSync(keyPath, 'utf8');
}

/**
 * Decrypt base64-encoded encrypted seed using RSA/OAEP with SHA-256.
 */
export function decryptSeed(encryptedSeedB64) {
  try {
    const privateKeyPem = loadPrivateKey();
    const ciphertext = Buffer.from(encryptedSeedB64, 'base64');

    const plaintextBuf = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      ciphertext
    );

    const seedStr = plaintextBuf.toString('utf8').trim();

    if (seedStr.length !== 64 || !/^[0-9a-f]+$/.test(seedStr)) {
      throw new Error('Invalid seed format after decryption');
    }

    return seedStr;
  } catch (err) {
    console.error('decryptSeed error:', err.message);
    throw new Error('Decryption failed');
  }
}
