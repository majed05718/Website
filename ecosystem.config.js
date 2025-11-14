/**
 * ==============================================================================
 * MASTER PM2 ECOSYSTEM CONFIGURATION FILE
 * المصدر المركزي الوحيد لكل الإعدادات
 * ==============================================================================
 * 
 * ✅ غير البورتات هنا فقط - وكل شيء يتحدث تلقائياً
 * Change ports HERE ONLY - everything updates automatically
 */

// ═══════════════════════════════════════════════════════════════════════
// المصدر الوحيد للبورتات - SINGLE SOURCE OF TRUTH FOR PORTS
// ═══════════════════════════════════════════════════════════════════════
const PORTS = {
  PRODUCTION: {
    API: 3031,      // ← غير هنا فقط! Change HERE only!
    FRONTEND: 3000,
  },
  STAGING: {
    API: 3032,
    FRONTEND: 8088,
  }
};

// ═══════════════════════════════════════════════════════════════════════
// تكوين تلقائي للـ URLs - Automatic URL Configuration
// ═══════════════════════════════════════════════════════════════════════
const SERVER_IP = '64.227.166.229'; // Your server IP

const URLS = {
  PRODUCTION: {
    API_BASE: `http://${SERVER_IP}:${PORTS.PRODUCTION.API}`,
    FRONTEND_BASE: `http://${SERVER_IP}:${PORTS.PRODUCTION.FRONTEND}`,
  },
  STAGING: {
    API_BASE: `http://localhost:${PORTS.STAGING.API}`,
    FRONTEND_BASE: `http://localhost:${PORTS.STAGING.FRONTEND}`,
  }
};

// ═══════════════════════════════════════════════════════════════════════
// PM2 APPS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════
module.exports = {
  apps: [
    // ═══════════════════════════════════════════════════════════════════
    // PRODUCTION API
    // ═══════════════════════════════════════════════════════════════════
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
        PORT: PORTS.PRODUCTION.API,
        PROD_API_PORT: PORTS.PRODUCTION.API,
        PROD_FRONTEND_PORT: PORTS.PRODUCTION.FRONTEND,
        ALLOWED_ORIGINS: `http://${SERVER_IP}:${PORTS.PRODUCTION.FRONTEND},http://${SERVER_IP},https://${SERVER_IP}`,
      },
      
      error_file: './logs/prod-api-error.log',
      out_file: './logs/prod-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ═══════════════════════════════════════════════════════════════════
    // PRODUCTION FRONTEND
    // ═══════════════════════════════════════════════════════════════════
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
        PORT: PORTS.PRODUCTION.FRONTEND,
        NEXT_PUBLIC_API_URL: URLS.PRODUCTION.API_BASE,
        NEXT_PUBLIC_BACKEND_URL: URLS.PRODUCTION.API_BASE,
      },
      
      error_file: './logs/prod-frontend-error.log',
      out_file: './logs/prod-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGING API
    // ═══════════════════════════════════════════════════════════════════
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
        PORT: PORTS.STAGING.API,
        STAGING_API_PORT: PORTS.STAGING.API,
        STAGING_FRONTEND_PORT: PORTS.STAGING.FRONTEND,
        ALLOWED_ORIGINS: `http://localhost:${PORTS.STAGING.FRONTEND},http://127.0.0.1:${PORTS.STAGING.FRONTEND}`,
      },
      
      error_file: './logs/staging-api-error.log',
      out_file: './logs/staging-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGING FRONTEND
    // ═══════════════════════════════════════════════════════════════════
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
        PORT: PORTS.STAGING.FRONTEND,
        NEXT_PUBLIC_API_URL: URLS.STAGING.API_BASE,
        NEXT_PUBLIC_BACKEND_URL: URLS.STAGING.API_BASE,
      },
      
      error_file: './logs/staging-frontend-error.log',
      out_file: './logs/staging-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
