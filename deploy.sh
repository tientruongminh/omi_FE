#!/bin/bash
# Deploy script for OmiLearn FE
# Called by webhook on push to main

set -e
export HOME=/root
export PM2_HOME=/root/.pm2

LOG="/var/log/omilearn-deploy.log"
echo "$(date): Deploy started" >> $LOG

cd /root/.openclaw/workspace/omilearn/app

# Pull latest
git fetch origin main >> $LOG 2>&1
git reset --hard origin/main >> $LOG 2>&1

# Install deps (only if lockfile changed)
npm ci --production=false >> $LOG 2>&1

# Clean build (avoid stale manifest errors)
rm -rf .next
NEXT_PUBLIC_API_URL=https://api.omilearn.com npm run build >> $LOG 2>&1

# Restart
pm2 restart omilearn --update-env >> $LOG 2>&1

# Health check
sleep 3
if curl -sf http://localhost:3005/ > /dev/null; then
    echo "$(date): Deploy success!" >> $LOG
else
    echo "$(date): Deploy failed - health check failed" >> $LOG
    exit 1
fi
