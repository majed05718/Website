import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export interface JwtConfig {
  secret: string;
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

export default registerAs('app', (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    nodeEnv,
    port: parseInt(process.env.PORT || '3001', 10),
    frontendPort: parseInt(process.env.FRONTEND_PORT || '3000', 10),
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    database: {
      url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
  };
});
