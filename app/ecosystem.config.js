module.exports = {
  apps: [{
    name: 'omilearn',
    script: 'npm',
    args: 'start',
    cwd: '/root/.openclaw/workspace/omilearn/app',
    env: {
      PORT: 3005,
      NODE_ENV: 'production'
    },
    // Auto-restart
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    // Restart delays
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: '10s',
    // Logs
    error_file: '/root/.pm2/logs/omilearn-error.log',
    out_file: '/root/.pm2/logs/omilearn-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
}
