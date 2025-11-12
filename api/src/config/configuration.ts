import { registerAs } from '@nestjs/config';

/**
 * Centralized Configuration Module
 * 
 * This configuration intelligently selects between production and staging/development
 * environments based on NODE_ENV. It provides a single source of truth for all
 * application configuration.
 */

export interface DatabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendPort: number;
  allowedOrigins: string[];
  database: DatabaseConfig;
  jwt: JwtConfig;
}

/**
 * Configuration Factory
 * 
 * Automatically selects the correct configuration based on NODE_ENV.
 * - production: Uses PROD_* prefixed variables
 * - development/staging: Uses STAGING_* or default variables
 */
export default registerAs('app', (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // Environment-aware variable selection
  const getEnvVar = (prodKey: string, devKey: string, fallback: string = ''): string => {
    return isProduction 
      ? (process.env[prodKey] || process.env[devKey] || fallback)
      : (process.env[devKey] || process.env[prodKey] || fallback);
  };

  return {
    nodeEnv,
    
    // Port configuration
    port: parseInt(
      isProduction 
        ? (process.env.PROD_API_PORT || process.env.PORT || '3001')
        : (process.env.STAGING_API_PORT || process.env.PORT || '3002'),
      10
    ),
    
    frontendPort: parseInt(
      isProduction
        ? (process.env.PROD_FRONTEND_PORT || process.env.FRONTEND_PORT || '3000')
        : (process.env.STAGING_FRONTEND_PORT || process.env.FRONTEND_PORT || '8088'),
      10
    ),
    
    // CORS Configuration
    allowedOrigins: (
      isProduction
        ? (process.env.ALLOWED_ORIGINS_PROD || process.env.ALLOWED_ORIGINS || '')
        : (process.env.ALLOWED_ORIGINS_STAGING || process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    ).split(',').map(origin => origin.trim()).filter(Boolean),
    
    // Database Configuration (Supabase)
    database: {
      url: getEnvVar(
        'PROD_SUPABASE_URL',
        'SUPABASE_URL',
        process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      ),
      serviceRoleKey: getEnvVar(
        'PROD_SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ),
    },
    
    // JWT Configuration
    jwt: {
      secret: getEnvVar(
        'PROD_JWT_SECRET',
        'JWT_SECRET',
        'default-secret-change-in-production'
      ),
      refreshSecret: getEnvVar(
        'PROD_JWT_REFRESH_SECRET',
        'JWT_REFRESH_SECRET',
        getEnvVar('PROD_JWT_SECRET', 'JWT_SECRET', 'default-refresh-secret')
      ),
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
  };
});
