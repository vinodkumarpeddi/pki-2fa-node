// scripts/request_seed.js
import fs from 'node:fs';

const API_URL = 'https://eajeyq4r3zljoq4rpovy2nthda0vtjqf.lambda-url.ap-south-1.on.aws';

async function requestSeed() {
  const studentId = process.env.STUDENT_ID;
  const githubRepoUrl = process.env.GITHUB_REPO_URL;

  if (!studentId || !githubRepoUrl) {
    console.error('Set STUDENT_ID and GITHUB_REPO_URL env vars before running this.');
    process.exit(1);
  }

  const publicKeyPem = fs.readFileSync('student_public.pem', 'utf8');

  const body = {
    student_id: studentId,
    github_repo_url: githubRepoUrl,
    public_key: publicKeyPem
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    console.error('Instructor API error:', res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();

  if (data.status !== 'success' || !data.encrypted_seed) {
    console.error('API returned error:', data);
    process.exit(1);
  }

  fs.writeFileSync('encrypted_seed.txt', data.encrypted_seed.trim(), { mode: 0o600 });
  console.log('Saved encrypted seed to encrypted_seed.txt');
}

requestSeed().catch(err => {
  console.error('Request seed failed:', err);
  process.exit(1);
});
