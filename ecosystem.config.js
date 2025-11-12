/**
 * ==============================================================================
 * MASTER PM2 ECOSYSTEM CONFIGURATION FILE
 * Real Estate Management System - Multi-Environment Architecture
 * ==============================================================================
 *
 * This file is the Single Source of Truth for deploying and managing all
 * production and staging environments with complete isolation.
 *
 * ==============================================================================
 * ARCHITECTURE OVERVIEW
 * ==============================================================================
 *
 * Production Environment (NODE_ENV=production):
 *   - API:      Port 3001  →  /api/.env.production
 *   - Frontend: Port 3000  →  /Web/.env.production
 *   - Database: Production Supabase instance
 *   - Security: Full helmet, strict CORS
 *
 * Staging Environment (NODE_ENV=development):
 *   - API:      Port 3002  →  /api/.env.staging
 *   - Frontend: Port 8088  →  /Web/.env.development
 *   - Database: Staging/Dev Supabase instance
 *   - Security: Relaxed CORS, Swagger enabled
 *
 * ==============================================================================
 * HOW PM2 --ENV FLAG WORKS
 * ==============================================================================
 *
 * PM2's --env flag selects which app blocks to run based on their env_* keys.
 * It does NOT pass environment variables directly. Instead:
 *
 * 1. When you run: `pm2 start ecosystem.config.js --env production`
 *    - PM2 looks for apps with `env_production` blocks
 *    - Only apps with `env_production` defined will start
 *    - The variables in `env_production` are injected into the process
 *    - The NODE_ENV setting triggers the correct .env file loading
 *
 * 2. When you run: `pm2 start ecosystem.config.js --env staging`
 *    - PM2 looks for apps with `env_staging` blocks
 *    - Only apps with `env_staging` defined will start
 *    - The variables in `env_staging` are injected into the process
 *
 * 3. If you DON'T use --env flag (just `pm2 start ecosystem.config.js`):
 *    - PM2 uses the base `env` block for ALL apps
 *    - This would cause CONFLICTS as both prod and staging try to use same ports
 *    - ❌ DO NOT DO THIS - Always use --env flag!
 *
 * ==============================================================================
 * USAGE COMMANDS
 * ==============================================================================
 *
 * START ENVIRONMENTS:
 * -------------------
 * Start Production Only:
 *   $ pm2 start ecosystem.config.js --env production
 *
 * Start Staging Only:
 *   $ pm2 start ecosystem.config.js --env staging
 *
 * Start Specific App:
 *   $ pm2 start ecosystem.config.js --env production --only prod-api
 *   $ pm2 start ecosystem.config.js --env staging --only staging-frontend
 *
 * MANAGEMENT COMMANDS:
 * --------------------
 * View All Processes:     $ pm2 list
 * View Logs (All):        $ pm2 logs
 * View Logs (Specific):   $ pm2 logs prod-api
 * Monitor Resources:      $ pm2 monit
 * Restart App:            $ pm2 restart prod-api
 * Stop App:               $ pm2 stop prod-api
 * Delete App:             $ pm2 delete prod-api
 * Stop All:               $ pm2 stop all
 * Delete All:             $ pm2 delete all
 *
 * TROUBLESHOOTING:
 * ----------------
 * Port Already in Use (EADDRINUSE):
 *   1. Check processes: sudo lsof -i :3000 -i :3001 -i :3002 -i :8088
 *   2. Kill processes:  kill -9 <PID>
 *   3. Clean PM2:       pm2 delete all
 *   4. Restart:         pm2 start ecosystem.config.js --env production
 *
 * ==============================================================================
 * ENVIRONMENT FILE LOADING FLOW
 * ==============================================================================
 *
 * Backend (NestJS):
 *   1. PM2 sets NODE_ENV via env_production or env_staging
 *   2. NestJS ConfigModule loads /api/.env.{NODE_ENV}
 *   3. api/src/config/configuration.ts reads variables
 *   4. main.ts gets port from ConfigService
 *
 * Frontend (Next.js):
 *   1. PM2 sets NODE_ENV via env_production or env_staging
 *   2. Next.js automatically loads /Web/.env.{NODE_ENV}
 *   3. Process uses PORT variable from env file
 *
 * ==============================================================================
 */

module.exports = {
  apps: [
    // ═══════════════════════════════════════════════════════════════════════
    // PRODUCTION ENVIRONMENT - API
    // ═══════════════════════════════════════════════════════════════════════
    {
      name: 'prod-api',
      script: './dist/main.js',
      cwd: './api',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      
      // Base env - NEVER USED (must specify --env flag)
      env: {
        NODE_ENV: 'production',
      },
      
      // Production-specific environment
      // Activated with: pm2 start ecosystem.config.js --env production
      env_production: {
        NODE_ENV: 'production',
        // Port 3001 is set in /api/.env.production
        // All other variables loaded from /api/.env.production
      },
      
      // Logging
      error_file: './logs/prod-api-error.log',
      out_file: './logs/prod-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PRODUCTION ENVIRONMENT - FRONTEND
    // ═══════════════════════════════════════════════════════════════════════
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
      
      // Base env - NEVER USED
      env: {
        NODE_ENV: 'production',
      },
      
      // Production-specific environment
      // Activated with: pm2 start ecosystem.config.js --env production
      env_production: {
        NODE_ENV: 'production',
        // Port 3000 is set in /Web/.env.production
        // All other variables loaded from /Web/.env.production
      },
      
      // Logging
      error_file: './logs/prod-frontend-error.log',
      out_file: './logs/prod-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STAGING/DEVELOPMENT ENVIRONMENT - API
    // ═══════════════════════════════════════════════════════════════════════
    {
      name: 'staging-api',
      script: './dist/main.js',
      cwd: './api',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      
      // Base env - NEVER USED
      env: {
        NODE_ENV: 'development',
      },
      
      // Staging-specific environment
      // Activated with: pm2 start ecosystem.config.js --env staging
      env_staging: {
        NODE_ENV: 'development',
        // This triggers loading of /api/.env.staging
        // Port 3002 is set in /api/.env.staging
      },
      
      // Logging
      error_file: './logs/staging-api-error.log',
      out_file: './logs/staging-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STAGING/DEVELOPMENT ENVIRONMENT - FRONTEND
    // ═══════════════════════════════════════════════════════════════════════
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
      
      // Base env - NEVER USED
      env: {
        NODE_ENV: 'development',
      },
      
      // Staging-specific environment
      // Activated with: pm2 start ecosystem.config.js --env staging
      env_staging: {
        NODE_ENV: 'development',
        // This triggers loading of /Web/.env.development
        // Port 8088 is set in /Web/.env.development
      },
      
      // Logging
      error_file: './logs/staging-frontend-error.log',
      out_file: './logs/staging-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
