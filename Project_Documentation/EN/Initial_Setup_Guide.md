# 🚀 Initial Setup Guide

## Configuration Unification & First Administrator Setup

This guide walks you through the complete setup process for the Property Management System, including environment configuration and creating the first administrator user.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Environment Configuration](#environment-configuration)
3. [Creating the First SuperAdmin User](#creating-the-first-superadmin-user)
4. [Starting the Application](#starting-the-application)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)

---

## System Architecture Overview

### Configuration Single Source of Truth

The application now uses a **centralized configuration system** with the following architecture:

```
/workspace
├── api/
│   ├── .env                      # Default fallback configuration
│   ├── .env.development          # Development environment config
│   ├── .env.production           # Production environment config
│   └── src/
│       └── config/
│           └── app.config.ts     # Typed configuration service
├── ecosystem.config.js           # PM2 process manager (env-aware)
└── Web/
    └── package.json              # Frontend (port from PM2 env)
```

### Key Principles

1. **No Hardcoded Values**: All ports, URLs, and secrets are read from environment files
2. **Environment-Aware**: Different settings for development vs. production
3. **Type-Safe**: Configuration validated through TypeScript interfaces
4. **PM2 Integration**: Process manager controls which environment to use

---

## Environment Configuration

### Step 1: Configure Backend Environment Files

The backend uses environment-specific configuration files in the `/api` directory.

#### For Development Environment

Edit `/api/.env.development`:

```bash
# ═══════════════════════════════════════════════════════════════
# Development Environment Configuration
# ═══════════════════════════════════════════════════════════════

NODE_ENV=development

# Application Ports
PORT=3001
FRONTEND_PORT=8088

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_service_role_key

# JWT Configuration
JWT_SECRET=your-development-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Allowed Origins
ALLOWED_ORIGINS=http://localhost:8088,http://127.0.0.1:8088,http://localhost:3000,http://127.0.0.1:3000
```

#### For Production Environment

Edit `/api/.env.production`:

```bash
# ═══════════════════════════════════════════════════════════════
# Production Environment Configuration
# ═══════════════════════════════════════════════════════════════

NODE_ENV=production

# Application Ports
PORT=3002
FRONTEND_PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_service_role_key

# JWT Configuration (CHANGE THESE!)
JWT_SECRET=USE_STRONG_RANDOM_SECRET_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Allowed Origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com
```

### Step 2: Get Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** → Use as `SUPABASE_URL`
   - **service_role secret** → Use as `SUPABASE_SERVICE_ROLE_KEY`
   
   ⚠️ **CRITICAL**: The service role key has full admin access. Never expose it publicly!

### Step 3: Generate JWT Secret

For production, generate a strong random JWT secret:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as your `JWT_SECRET` in `.env.production`.

---

## Creating the First SuperAdmin User

### Prerequisites

1. ✅ Environment files configured (`/api/.env.development` or `.env.production`)
2. ✅ Supabase connection working
3. ✅ Backend compiled (`npm run build` in `/api` directory)

### Step-by-Step Process

#### 1. Connect to Your Server

```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to the project directory
cd /workspace/api
```

#### 2. Ensure Dependencies are Installed

```bash
npm install
```

#### 3. Run the SuperAdmin Seeder

```bash
npm run seed:superadmin -- \
  --email="admin@yourdomain.com" \
  --password="YourVerySecurePassword123!" \
  --name="System Administrator" \
  --phone="+966500000000"
```

**Required Parameters:**
- `--email`: The administrator's email address (must be unique)
- `--password`: A strong password (minimum 8 characters, 12+ recommended)

**Optional Parameters:**
- `--name`: Full name (default: "System Administrator")
- `--phone`: Phone number (default: "+966500000000")

#### 4. Script Output

On success, you'll see:

```
═══════════════════════════════════════════════════════════
  🔐 SuperAdmin User Seeder
═══════════════════════════════════════════════════════════

🔗 Connecting to Supabase...
🔍 Checking if user already exists...
🏢 Checking for system office...
✅ System office found
🔒 Hashing password...
👤 Creating superadmin user...

═══════════════════════════════════════════════════════════
  ✅ SuperAdmin User Created Successfully!
═══════════════════════════════════════════════════════════
User Details:
  ID:        xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  Email:     admin@yourdomain.com
  Name:      System Administrator
  Phone:     +966500000000
  Role:      system_admin
  Office ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  Status:    active
═══════════════════════════════════════════════════════════

🎉 You can now login with these credentials!
   Email:    admin@yourdomain.com
   Password: (the password you provided)
```

#### 5. Security Best Practices

⚠️ **IMPORTANT**:
- Store the admin credentials in a secure password manager
- Never commit passwords to version control
- Change the default password after first login
- Enable 2FA if available

---

## Starting the Application

### Using PM2 (Recommended for Production)

The `ecosystem.config.js` file now supports environment-aware configurations.

#### Start Development Environment

```bash
# Start both API and Frontend in development mode
pm2 start ecosystem.config.js --only dev-api,dev-frontend

# Or start individually
pm2 start ecosystem.config.js --only dev-api
pm2 start ecosystem.config.js --only dev-frontend
```

**Development Configuration:**
- Backend API: Port `3001` (from `.env.development`)
- Frontend: Port `8088` (from PM2 env)
- NODE_ENV: `development`

#### Start Production Environment

```bash
# Start both API and Frontend in production mode
pm2 start ecosystem.config.js --only prod-api,prod-frontend

# Or start individually
pm2 start ecosystem.config.js --only prod-api
pm2 start ecosystem.config.js --only prod-frontend
```

**Production Configuration:**
- Backend API: Port `3002` (from `.env.production`)
- Frontend: Port `3000` (from PM2 env)
- NODE_ENV: `production`

#### Manage PM2 Processes

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# Restart all processes
pm2 restart all

# Stop all processes
pm2 stop all

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Manual Start (Development Only)

```bash
# Terminal 1: Backend
cd /workspace/api
NODE_ENV=development npm run start:prod

# Terminal 2: Frontend
cd /workspace/Web
PORT=8088 npm start
```

---

## Verification & Testing

### 1. Check Backend Health

```bash
# Development
curl http://localhost:3001/health

# Production
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T12:00:00.000Z",
  "environment": "development",
  "port": 3001
}
```

### 2. Test SuperAdmin Login

#### Using cURL

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "YourVerySecurePassword123!"
  }'
```

Expected response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@yourdomain.com",
    "role": "system_admin",
    "office_id": "..."
  }
}
```

#### Using Frontend

1. Open browser and navigate to:
   - Development: `http://localhost:8088`
   - Production: `http://your-domain.com`

2. Enter the admin credentials
3. You should be redirected to the dashboard

### 3. Verify Configuration Loading

Check PM2 logs to ensure the correct environment is loaded:

```bash
pm2 logs dev-api --lines 50
```

Look for the startup message:
```
═══════════════════════════════════════════════════
🚀 Backend is running!
📍 Local URL:    http://localhost:3001
📚 Environment:  development
🔒 CORS Origins: http://localhost:8088, ...
📖 Swagger UI:   http://localhost:3001/api/docs
═══════════════════════════════════════════════════
```

---

## Troubleshooting

### Issue: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"

**Solution:**
1. Verify `.env.development` or `.env.production` exists in `/api` directory
2. Check that the file contains valid Supabase credentials
3. Ensure PM2 is restarted after changing .env files: `pm2 restart all`

### Issue: "User with email already exists"

**Solution:**
- The email is already registered in the database
- Either use a different email or manually delete the existing user:
  ```sql
  DELETE FROM users WHERE email = 'admin@yourdomain.com';
  ```

### Issue: "Port already in use"

**Solution:**
1. Check which process is using the port:
   ```bash
   sudo lsof -i :3001  # or :3002 for production
   ```
2. Stop the conflicting process or change the PORT in `.env.development`/`.env.production`
3. Restart PM2: `pm2 restart all`

### Issue: "Cannot connect to Supabase"

**Solution:**
1. Verify your Supabase URL is correct (should start with `https://`)
2. Check your service role key is complete (very long JWT string)
3. Test connection from command line:
   ```bash
   curl https://your-project-id.supabase.co/rest/v1/
   ```

### Issue: "Invalid password format"

**Solution:**
- Password must be at least 8 characters
- Use a strong password with mixed case, numbers, and symbols
- Wrap password in quotes if it contains special shell characters:
  ```bash
  npm run seed:superadmin -- --email="admin@test.com" --password="P@ssw0rd!"
  ```

### Issue: Frontend shows "Network Error"

**Solution:**
1. Verify the backend is running: `curl http://localhost:3001/health`
2. Check `ALLOWED_ORIGINS` in `.env.development` includes the frontend URL
3. Verify frontend's `NEXT_PUBLIC_API_URL` points to the correct backend URL

---

## Configuration Files Reference

### Backend Configuration Structure

```typescript
// /api/src/config/app.config.ts
export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendPort: number;
  allowedOrigins: string[];
  database: {
    url: string;
    serviceRoleKey: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
}
```

### PM2 Ecosystem Configuration

```javascript
// /workspace/ecosystem.config.js
module.exports = {
  apps: [
    // Production Apps
    { name: 'prod-api', env: { NODE_ENV: 'production' } },
    { name: 'prod-frontend', env: { NODE_ENV: 'production', PORT: 3000 } },
    
    // Development Apps
    { name: 'dev-api', env: { NODE_ENV: 'development' } },
    { name: 'dev-frontend', env: { NODE_ENV: 'development', PORT: 8088 } },
  ]
};
```

---

## Next Steps

After completing the initial setup:

1. ✅ **Login** with the superadmin account
2. 📋 **Create additional users** through the admin panel
3. 🏢 **Set up offices** and configure office-specific settings
4. 🔐 **Enable additional security** features (2FA, IP whitelisting)
5. 📊 **Monitor logs** using `pm2 logs` and `pm2 monit`
6. 🔄 **Configure backups** for your Supabase database
7. 🚀 **Set up CI/CD** pipeline for automated deployments

---

## Support & Resources

- **Documentation**: `/workspace/Project_Documentation/`
- **API Documentation**: `http://localhost:3001/api/docs` (development only)
- **Supabase Dashboard**: https://app.supabase.com
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/

---

**Last Updated**: 2025-11-11  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
