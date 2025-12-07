
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const {
  RSA_PKCS1_OAEP_PADDING,
  RSA_PKCS1_PSS_PADDING,
  RSA_PSS_SALTLEN_MAX_SIGN
} = crypto.constants;

function loadStudentPrivateKey() {
  return fs.readFileSync('student_private.pem', 'utf8');
}

function loadInstructorPublicKey() {
  return fs.readFileSync('instructor_public.pem', 'utf8');
}

function getCommitHash() {
  const out = execSync('git log -1 --format=%H', { encoding: 'utf8' }).trim();
  if (!/^[0-9a-f]{40}$/.test(out)) {
    throw new Error('Invalid commit hash: ' + out);
  }
  return out;
}

function signMessage(message, privateKeyPem) {
  return crypto.sign(
    'sha256',
    Buffer.from(message, 'utf8'), // ASCII hex string
    {
      key: privateKeyPem,
      padding: RSA_PKCS1_PSS_PADDING,
      saltLength: RSA_PSS_SALTLEN_MAX_SIGN
    }
  );
}

function encryptWithPublicKey(dataBuf, publicKeyPem) {
  return crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    dataBuf
  );
}

function main() {
  const commitHash = getCommitHash();
  const priv = loadStudentPrivateKey();
  const instrPub = loadInstructorPublicKey();

  const sig = signMessage(commitHash, priv);
  const encryptedSig = encryptWithPublicKey(sig, instrPub);
  const b64 = encryptedSig.toString('base64');

  console.log('Commit Hash:', commitHash);
  console.log('Encrypted Signature (base64, single line):');
  console.log(b64);
}

main();
