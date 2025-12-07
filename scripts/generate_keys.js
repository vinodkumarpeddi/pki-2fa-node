// scripts/generate_keys.js
import fs from 'node:fs';
import crypto from 'node:crypto';

function generateRsaKeypair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,          // 4096 bits
    publicExponent: 0x10001,      // 65537
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  fs.writeFileSync('student_private.pem', privateKey, { mode: 0o600 });
  fs.writeFileSync('student_public.pem', publicKey, { mode: 0o644 });

  console.log('Generated student_private.pem and student_public.pem');
}

generateRsaKeypair();
