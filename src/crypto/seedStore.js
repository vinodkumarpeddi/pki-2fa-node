// src/crypto/seedStore.js
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || '/data';
const SEED_FILE = path.join(DATA_DIR, 'seed.txt');

export function saveSeed(hexSeed) {
  if (hexSeed.length !== 64 || !/^[0-9a-f]+$/.test(hexSeed)) {
    throw new Error('Invalid seed format');
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SEED_FILE, hexSeed + '\n', { mode: 0o600 });
}

export function seedExists() {
  return fs.existsSync(SEED_FILE);
}

export function loadSeed() {
  if (!seedExists()) {
    throw new Error('Seed not decrypted yet');
  }
  const hexSeed = fs.readFileSync(SEED_FILE, 'utf8').trim();
  if (hexSeed.length !== 64 || !/^[0-9a-f]+$/.test(hexSeed)) {
    throw new Error('Stored seed is invalid');
  }
  return hexSeed;
}
