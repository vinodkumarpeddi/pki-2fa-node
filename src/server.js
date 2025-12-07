// src/server.js
import 'dotenv/config.js';
import express from 'express';
import morgan from 'morgan';

import { decryptSeed } from './crypto/decryptSeed.js';
import { saveSeed, loadSeed, seedExists } from './crypto/seedStore.js';
import { generateTotpCode, verifyTotpCode, getSecondsRemainingInWindow } from './crypto/totp.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(morgan('dev'));

// Optional health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * POST /decrypt-seed
 * Body: { "encrypted_seed": "BASE64..." }
 */
app.post('/decrypt-seed', (req, res) => {
  try {
    const { encrypted_seed } = req.body || {};
    if (!encrypted_seed || typeof encrypted_seed !== 'string') {
      return res.status(400).json({ error: 'Missing encrypted_seed' });
    }

    const hexSeed = decryptSeed(encrypted_seed);
    saveSeed(hexSeed);

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('/decrypt-seed error:', err.message);
    return res.status(500).json({ error: 'Decryption failed' });
  }
});

/**
 * GET /generate-2fa
 */
app.get('/generate-2fa', (req, res) => {
  try {
    if (!seedExists()) {
      return res.status(500).json({ error: 'Seed not decrypted yet' });
    }
    const hexSeed = loadSeed();
    const code = generateTotpCode(hexSeed);
    const validFor = getSecondsRemainingInWindow();

    return res.json({ code, valid_for: validFor });
  } catch (err) {
    console.error('/generate-2fa error:', err.message);
    return res.status(500).json({ error: 'Failed to generate 2FA code' });
  }
});

/**
 * POST /verify-2fa
 * Body: { "code": "123456" }
 */
app.post('/verify-2fa', (req, res) => {
  try {
    if (!seedExists()) {
      return res.status(500).json({ error: 'Seed not decrypted yet' });
    }

    const { code } = req.body || {};
    if (!code) {
      return res.status(400).json({ error: 'Missing code' });
    }

    const hexSeed = loadSeed();
    const isValid = verifyTotpCode(hexSeed, String(code), 1); // ±1 period

    return res.json({ valid: isValid });
  } catch (err) {
    console.error('/verify-2fa error:', err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth microservice listening on port ${PORT}`);
});
