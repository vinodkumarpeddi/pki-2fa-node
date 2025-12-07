# Stage 1: Builder
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY src ./src
COPY scripts ./scripts
COPY cron ./cron
COPY student_private.pem student_public.pem instructor_public.pem ./

# Stage 2: Runtime
FROM node:20-slim

ENV NODE_ENV=production
ENV TZ=UTC
WORKDIR /app

RUN apt-get update && \
    apt-get install -y cron tzdata && \
    ln -fs /usr/share/zoneinfo/UTC /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/cron ./cron
COPY --from=builder /app/student_private.pem /app/student_private.pem
COPY --from=builder /app/student_public.pem /app/student_public.pem
COPY --from=builder /app/instructor_public.pem /app/instructor_public.pem
COPY package*.json ./

# 🔥 IMPORTANT: Make cron script executable
RUN chmod +x /app/scripts/log_2fa_cron.js

RUN mkdir -p /data /cron && \
    chmod 755 /data /cron

COPY cron/2fa-cron /etc/cron.d/2fa-cron
RUN chmod 0644 /etc/cron.d/2fa-cron && \
    crontab /etc/cron.d/2fa-cron

EXPOSE 8080

ENV DATA_DIR=/data
ENV PORT=8080
ENV STUDENT_PRIVATE_KEY_PATH=/app/student_private.pem

CMD ["sh", "-c", "cron && node src/server.js"]
