#  PKI-Based 2FA Microservice (Node.js)

A secure microservice that performs:

- RSA-OAEP decryption of encrypted seed  
- TOTP (RFC 6238) 2FA code generation  
- TOTP verification with ±30s window  
- Cron-based 1-minute logging of 2FA codes (UTC)  
- Persistent seed storage using Docker volumes  
- PKI commit-signature generation using RSA-PSS  

This project was implemented as part of the Partnr PKI-2FA assignment.

---

## Features

### ✔️ **1. Decrypt Seed (RSA-OAEP-SHA256)**  
Decrypts the encrypted seed received from the instructor API using the student’s private key.

### ✔️ **2. Generate 2FA Code (TOTP-SHA1, Base32 Secret)**  
Generates the valid 6-digit 2FA code using:

- SHA-1  
- 30-second step  
- Base32-encoded seed  
- RFC 6238 compliant

### ✔️ **3. Verify 2FA Code**  
Accepts ±1 time window (±30 seconds) to handle clock drift.

### ✔️ **4. Cron Job (Every Minute)**  
A cron job runs every minute, logs the current UTC timestamp and the TOTP code to:

/cron/last_code.txt


### ✔️ **5. Dockerized Microservice**  
Multi-stage Dockerfile with:

- Node 20-slim
- Cron
- UTC timezone
- Persistent volumes for `/data` and `/cron`

### ✔️ **6. Commit Signature Generator**  
Signs the Git commit hash using:

- RSA-PSS  
- SHA-256  
- Max salt length  

Then encrypts the signature using the **instructor public key (RSA-OAEP-SHA256)**.

---

## 📂 Project Structure

.
├── Dockerfile
├── docker-compose.yml
├── cron/
│ └── 2fa-cron
├── scripts/
│ ├── log_2fa_cron.js
│ ├── request_seed.js
│ ├── generate_keys.js
│ └── commit_sign.js
├── src/
│ ├── server.js
│ └── crypto/
│ ├── decryptSeed.js
│ ├── seedStore.js
│ └── totp.js
├── student_private.pem
├── student_public.pem
├── instructor_public.pem
├── package.json
└── README.md


---

## 🐳 Running the Service with Docker

### **Build & Run**

```bash
docker-compose build
docker-compose up -d
The service runs at:

http://localhost:8080
🧪 API Endpoints
1️⃣ POST /decrypt-seed
curl -X POST http://localhost:8080/decrypt-seed \
  -H "Content-Type: application/json" \
  -d "{\"encrypted_seed\": \"$(cat encrypted_seed.txt)\"}"
Response:

{ "status": "ok" }
2️⃣ GET /generate-2fa
curl http://localhost:8080/generate-2fa
Response example:

{
  "code": "123456",
  "valid_for": 17
}
3️⃣ POST /verify-2fa
CODE=$(curl -s http://localhost:8080/generate-2fa | jq -r '.code')

curl -X POST http://localhost:8080/verify-2fa \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$CODE\"}"
Response:

{ "valid": true }


 Cron Job Output
Cron runs every minute and writes to:

docker exec 10cc51672985 cat /cron/last_code.txt
Example output:

2025-12-10 05:16:00 - 2FA Code: 342497
 Commit Proof (RSA-PSS + RSA-OAEP)
Run:

node scripts/commit_sign.js
Outputs:

Commit Hash (40-char SHA-1)

Encrypted Signature (base64)

You must submit both.



Docker Image Url:

docker.io/vinodkumarpeddi/pki-2fa-node:latest




