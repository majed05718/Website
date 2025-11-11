/**
 * PM2 Ecosystem Configuration
 * 
 * This file defines different application configurations for production and development environments.
 * 
 * Usage:
 *   Development:  pm2 start ecosystem.config.js --only dev-api,dev-frontend
 *   Production:   pm2 start ecosystem.config.js --only prod-api,prod-frontend
 *   All:          pm2 start ecosystem.config.js
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
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        // PORT and other configs will be read from api/.env.production
      },
      error_file: './logs/prod-api-error.log',
      out_file: './logs/prod-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'prod-frontend',
      script: 'npm',
      args: 'start',
      cwd: './Web',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        // PORT will be read from environment (set by Next.js)
        PORT: 3000,
      },
      error_file: './logs/prod-frontend-error.log',
      out_file: './logs/prod-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    // ═══════════════════════════════════════════════════════════════
    // DEVELOPMENT/STAGING APPLICATIONS
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'dev-api',
      script: './dist/main.js',
      cwd: './api',
      instances: 1,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        // PORT and other configs will be read from api/.env.development
      },
      error_file: './logs/dev-api-error.log',
      out_file: './logs/dev-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'dev-frontend',
      script: 'npm',
      args: 'start',
      cwd: './Web',
      instances: 1,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        // PORT will be read from environment (set by Next.js)
        PORT: 8088,
      },
      error_file: './logs/dev-frontend-error.log',
      out_file: './logs/dev-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
