/**
 * ═══════════════════════════════════════════════════════════════
 * PM2 ECOSYSTEM CONFIGURATION
 * Multi-Environment Architecture
 * ═══════════════════════════════════════════════════════════════
 * 
 * This configuration enables SIMULTANEOUS execution of production
 * and staging environments, each with complete isolation.
 * 
 * ARCHITECTURE:
 * - Production API:     Port 3001 (NODE_ENV=production)
 * - Production Frontend: Port 3000 (NODE_ENV=production)
 * - Staging API:        Port 3002 (NODE_ENV=development)
 * - Staging Frontend:   Port 8088 (NODE_ENV=development)
 * 
 * USAGE:
 *   Start All:          pm2 start ecosystem.config.js
 *   Start Production:   pm2 start ecosystem.config.js --only prod-api,prod-frontend
 *   Start Staging:      pm2 start ecosystem.config.js --only staging-api,staging-frontend
 *   Stop All:           pm2 stop all
 *   Restart All:        pm2 restart all
 *   View Logs:          pm2 logs
 *   Monitor:            pm2 monit
 * 
 * ENVIRONMENT VARIABLE LOADING:
 * - Production apps load from: api/.env.production & Web/.env.production
 * - Staging apps load from:    api/.env.development & Web/.env.development
 * 
 * The NODE_ENV setting triggers the correct configuration loading
 * through the centralized configuration system.
 */

module.exports = {
  apps: [
    // ═══════════════════════════════════════════════════════════════
    // PRODUCTION APPLICATIONS
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'prod-api',
      script: './dist/main.js',
      cwd: './api',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/prod-api-error.log',
      out_file: './logs/prod-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'prod-frontend',
      script: 'npm',
      args: 'start',
      cwd: './Web',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/prod-frontend-error.log',
      out_file: './logs/prod-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // STAGING APPLICATIONS (Development Environment)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'staging-api',
      script: './dist/main.js',
      cwd: './api',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      env: {
        NODE_ENV: 'development',
      },
      error_file: './logs/staging-api-error.log',
      out_file: './logs/staging-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'staging-frontend',
      script: 'npm',
      args: 'start',
      cwd: './Web',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      env: {
        NODE_ENV: 'development',
      },
      error_file: './logs/staging-frontend-error.log',
      out_file: './logs/staging-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
