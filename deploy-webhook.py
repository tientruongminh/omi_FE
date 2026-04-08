#!/usr/bin/env python3
"""
GitHub Webhook → Auto Deploy for OmiLearn FE.

Listens on port 9876 for push events to main branch.
Verifies HMAC signature, then pulls + builds + restarts.
"""

import hashlib
import hmac
import json
import logging
import subprocess
import sys
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

# ── Config ─────────────────────────────────────────────────────

PORT = 9876
SECRET = "04741ced385c86987c878b258c7e8e45a2417423"
REPO_DIR = "/root/.openclaw/workspace/omi_FE"
APP_DIR = f"{REPO_DIR}/app"
BRANCH = "main"
SERVICE = "omilearn-fe"
LOG_FILE = "/var/log/omi-fe-deploy.log"

# ── Logging ────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("deploy")

# ── Deploy Logic ───────────────────────────────────────────────

deploy_lock = threading.Lock()


def run_deploy():
    """Pull latest code, install deps, build, restart service."""
    if not deploy_lock.acquire(blocking=False):
        log.warning("Deploy already in progress, skipping.")
        return

    try:
        log.info("🚀 Starting deploy...")

        steps = [
            ("git fetch", ["git", "-C", REPO_DIR, "fetch", "origin", BRANCH]),
            ("git reset", ["git", "-C", REPO_DIR, "reset", "--hard", f"origin/{BRANCH}"]),
            ("npm ci", ["npm", "ci", "--production=false"], APP_DIR, {
                "HOME": "/root",
                "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
            }),
            ("build", ["npm", "run", "build"], APP_DIR, {
                "NEXT_PUBLIC_API_URL": "https://omilearn.com/api",
                "HOME": "/root",
                "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
            }),
            ("restart", ["systemctl", "restart", SERVICE]),
        ]

        for step in steps:
            name = step[0]
            cmd = step[1]
            cwd = step[2] if len(step) > 2 and isinstance(step[2], str) else None
            extra_env = step[3] if len(step) > 3 else None

            log.info(f"  → {name}")

            env = None
            if extra_env:
                import os
                env = os.environ.copy()
                env.update(extra_env)

            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=600,  # 10 min max per step
                env=env,
            )

            if result.returncode != 0:
                log.error(f"  ✗ {name} failed (exit {result.returncode})")
                log.error(f"    stderr: {result.stderr[:500]}")
                return

            log.info(f"  ✓ {name}")

        # Health check
        import time
        time.sleep(4)
        try:
            import urllib.request
            urllib.request.urlopen("http://localhost:3000/login", timeout=5)
            log.info("✅ Deploy success! Health check passed.")
        except Exception as e:
            log.warning(f"⚠️ Deploy done but health check failed: {e}")

    except subprocess.TimeoutExpired as e:
        log.error(f"✗ Deploy timed out at step: {e}")
    except Exception as e:
        log.error(f"✗ Deploy error: {e}")
    finally:
        deploy_lock.release()


# ── Webhook Handler ────────────────────────────────────────────

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/webhook/deploy":
            self.send_response(404)
            self.end_headers()
            return

        # Read body
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        # Verify signature
        signature = self.headers.get("X-Hub-Signature-256", "")
        expected = "sha256=" + hmac.new(
            SECRET.encode(), body, hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            log.warning(f"Invalid signature from {self.client_address[0]}")
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"Invalid signature")
            return

        # Parse payload
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            return

        # Check if push to main
        ref = payload.get("ref", "")
        if ref != f"refs/heads/{BRANCH}":
            log.info(f"Push to {ref}, ignoring (not {BRANCH})")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Ignored: not main branch")
            return

        pusher = payload.get("pusher", {}).get("name", "unknown")
        head_commit = payload.get("head_commit", {}).get("message", "")[:80]
        log.info(f"📦 Push from {pusher}: {head_commit}")

        # Respond immediately, deploy in background
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Deploy triggered")

        # Start deploy in background thread
        threading.Thread(target=run_deploy, daemon=True).start()

    def do_GET(self):
        if self.path == "/webhook/health":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress default access logs
        pass


# ── Main ───────────────────────────────────────────────────────

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    log.info(f"🎯 Webhook server listening on port {PORT}")
    log.info(f"   Endpoint: POST /webhook/deploy")
    log.info(f"   Health:   GET  /webhook/health")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Shutting down.")
        server.server_close()
