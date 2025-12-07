#!/usr/bin/env node

// scripts/log_2fa_cron.js
import { loadSeed } from '../src/crypto/seedStore.js';
import { generateTotpCode } from '../src/crypto/totp.js';

function getUtcTimestamp() {
  const iso = new Date().toISOString();
  return iso.slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS
}

async function main() {
  try {
    const hexSeed = loadSeed();
    const code = generateTotpCode(hexSeed);
    const ts = getUtcTimestamp();
    console.log(`${ts} - 2FA Code: ${code}`);
  } catch (err) {
    console.error('Cron error:', err.message);
  }
}

main();
