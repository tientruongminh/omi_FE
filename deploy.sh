#!/bin/bash
# Deploy script for OmiLearn FE
# Called by webhook on push to main

set -e
export HOME=/root
export PM2_HOME=/root/.pm2

LOG="/var/log/omilearn-deploy.log"
echo "$(date): Deploy started" >> $LOG

cd /root/.openclaw/workspace/omilearn

# Pull latest at repo root
git fetch origin main >> $LOG 2>&1
git reset --hard origin/main >> $LOG 2>&1

# Move into Next.js project
cd app

# Install deps
rm -f package-lock.json
npm install --production=false >> $LOG 2>&1

# Clean build (avoid stale manifest errors)
rm -rf .next
NEXT_PUBLIC_API_URL=https://omilearn.com/api npm run build >> $LOG 2>&1

# Stop old process, start fresh
pm2 delete omilearn 2>/dev/null || true
pm2 start ecosystem.config.js >> $LOG 2>&1

# Health check
sleep 5
if curl -sf http://localhost:3000/ > /dev/null; then
    echo "$(date): Deploy success!" >> $LOG
else
    echo "$(date): Deploy failed - health check failed" >> $LOG
    exit 1
fi
