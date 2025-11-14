# 🚀 **Multi-Environment Deployment Guide**

**Real Estate Management System**  
**Complete Guide to Production & Staging Environment Management**

---

## 📋 **Table of Contents**

1. [Architecture Overview](#architecture-overview)
2. [Environment Configuration](#environment-configuration)
3. [Port Allocation](#port-allocation)
4. [PM2 Usage Guide](#pm2-usage-guide)
5. [Troubleshooting EADDRINUSE](#troubleshooting-eaddrinuse)
6. [Complete Deployment Procedures](#complete-deployment-procedures)
7. [Environment Variable Reference](#environment-variable-reference)
8. [Health Checks & Monitoring](#health-checks--monitoring)

---

## 🏗️ **Architecture Overview**

### **Environment Isolation**

The system supports **two completely isolated environments** that can run **simultaneously** on the same server:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Production Environment                    │
├─────────────────────────────────────────────────────────────────┤
│  API Backend         →  Port 3001  →  /api/.env.production     │
│  Next.js Frontend    →  Port 3000  →  /Web/.env.production     │
│  Database            →  Production Supabase Instance            │
│  Security            →  Strict CORS, Helmet enabled             │
│  NODE_ENV            →  production                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Staging/Development Environment               │
├─────────────────────────────────────────────────────────────────┤
│  API Backend         →  Port 3002  →  /api/.env.development    │
│  Next.js Frontend    →  Port 8088  →  /Web/.env.development    │
│  Database            →  Staging Supabase Instance               │
│  Security            →  Relaxed CORS, Swagger enabled           │
│  NODE_ENV            →  development                             │
└─────────────────────────────────────────────────────────────────┘
```

### **Configuration Flow**

```
┌───────────────┐
│  PM2 starts   │
│  with --env   │
└───────┬───────┘
        │
        ├──────────────────────────┬──────────────────────────┐
        │                          │                          │
        v                          v                          v
  env_production            env_staging               env (NEVER USED)
  NODE_ENV=production       NODE_ENV=development      
        │                          │
        v                          v
┌───────────────────┐      ┌───────────────────┐
│ NestJS ConfigModule│      │ NestJS ConfigModule│
│ loads:             │      │ loads:             │
│ .env.production    │      │ .env.development   │
└───────┬───────────┘      └───────┬───────────┘
        │                          │
        v                          v
┌───────────────────┐      ┌───────────────────┐
│ configuration.ts  │      │ configuration.ts  │
│ reads variables   │      │ reads variables   │
│ - Port: 3001      │      │ - Port: 3002      │
│ - PROD_* vars     │      │ - STAGING_* vars  │
└───────┬───────────┘      └───────┬───────────┘
        │                          │
        v                          v
┌───────────────────┐      ┌───────────────────┐
│    main.ts        │      │    main.ts        │
│ app.listen(3001)  │      │ app.listen(3002)  │
└───────────────────┘      └───────────────────┘
```

---

## ⚙️ **Environment Configuration**

### **Backend (NestJS)**

#### **Production** - `/api/.env.production`

```bash
NODE_ENV=production
PORT=3001
PROD_API_PORT=3001

SUPABASE_URL=https://your-prod-instance.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

JWT_SECRET=your-strong-production-jwt-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret

ALLOWED_ORIGINS_PROD=https://yourdomain.com,http://64.227.166.229
```

#### **Staging** - `/api/.env.development`

```bash
NODE_ENV=development
PORT=3002
STAGING_API_PORT=3002

SUPABASE_URL=https://your-staging-instance.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

JWT_SECRET=staging-jwt-secret-for-development-only
JWT_REFRESH_SECRET=staging-jwt-refresh-secret

ALLOWED_ORIGINS_STAGING=http://localhost:8088,http://127.0.0.1:8088
```

### **Frontend (Next.js)**

#### **Production** - `/Web/.env.production`

```bash
NODE_ENV=production
PORT=3000

NEXT_PUBLIC_API_URL=http://64.227.166.229/api
NEXT_PUBLIC_BACKEND_URL=http://64.227.166.229

NEXT_PUBLIC_SUPABASE_URL=https://your-prod-instance.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
```

#### **Staging** - `/Web/.env.development`

```bash
NODE_ENV=development
PORT=8088

NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002

NEXT_PUBLIC_SUPABASE_URL=https://your-staging-instance.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
```

---

## 🔌 **Port Allocation**

| Environment | Service | Port | Access URL |
|-------------|---------|------|------------|
| **Production** | Backend API | 3001 | http://server-ip:3001/api |
| **Production** | Frontend | 3000 | http://server-ip:3000 |
| **Production** | Health Check | 3001 | http://server-ip:3001/health |
| **Staging** | Backend API | 3002 | http://localhost:3002/api |
| **Staging** | Frontend | 8088 | http://localhost:8088 |
| **Staging** | Health Check | 3002 | http://localhost:3002/health |
| **Staging** | Swagger Docs | 3002 | http://localhost:3002/api/docs |

---

## 🎮 **PM2 Usage Guide**

### **Understanding PM2 --env Flag**

**CRITICAL:** PM2's `--env` flag selects which app configuration blocks to use. It does **NOT** directly pass environment variables.

```javascript
// In ecosystem.config.js:
{
  name: 'prod-api',
  env_production: {     // ← Used when --env production
    NODE_ENV: 'production'
  },
  env_staging: {        // ← Used when --env staging
    NODE_ENV: 'development'
  }
}
```

### **Starting Environments**

#### **Start Production Only**

```bash
# Start both production API and frontend
pm2 start ecosystem.config.js --env production

# Expected output:
# ┌─────┬──────────────────┬─────────┬─────────┬─────────┐
# │ id  │ name             │ mode    │ status  │ port    │
# ├─────┼──────────────────┼─────────┼─────────┼─────────┤
# │ 0   │ prod-api         │ fork    │ online  │ 3001    │
# │ 1   │ prod-frontend    │ fork    │ online  │ 3000    │
# └─────┴──────────────────┴─────────┴─────────┴─────────┘
```

#### **Start Staging Only**

```bash
# Start both staging API and frontend
pm2 start ecosystem.config.js --env staging

# Expected output:
# ┌─────┬──────────────────┬─────────┬─────────┬─────────┐
# │ id  │ name             │ mode    │ status  │ port    │
# ├─────┼──────────────────┼─────────┼─────────┼─────────┤
# │ 2   │ staging-api      │ fork    │ online  │ 3002    │
# │ 3   │ staging-frontend │ fork    │ online  │ 8088    │
# └─────┴──────────────────┴─────────┴─────────┴─────────┘
```

#### **Start Specific App Only**

```bash
# Start only production API
pm2 start ecosystem.config.js --env production --only prod-api

# Start only staging frontend
pm2 start ecosystem.config.js --env staging --only staging-frontend
```

### **Managing Processes**

```bash
# View all running processes
pm2 list

# View detailed process info
pm2 show prod-api

# Restart a process
pm2 restart prod-api

# Stop a process
pm2 stop staging-frontend

# Delete a process
pm2 delete prod-api

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Restart all processes
pm2 restart all
```

### **Viewing Logs**

```bash
# View logs for all processes (live)
pm2 logs

# View logs for specific process
pm2 logs prod-api

# View only error logs
pm2 logs --err

# View only output logs
pm2 logs --out

# View last 100 lines
pm2 logs --lines 100

# Clear logs
pm2 flush
```

### **Monitoring**

```bash
# Interactive monitoring dashboard
pm2 monit

# Process metrics
pm2 describe prod-api

# Save current PM2 configuration
pm2 save

# Resurrect saved processes after reboot
pm2 resurrect

# Setup PM2 to start on system boot
pm2 startup
```

---

## 🔧 **Troubleshooting EADDRINUSE**

### **Error Signature**

```
Error: listen EADDRINUSE: address already in use :::3001
    at Server.setupListenHandle [as _listen2] (net.js:1318:16)
```

### **Root Causes**

1. **Zombie processes** - Previous PM2 processes not properly stopped
2. **Port conflicts** - Another application using the same port
3. **Multiple PM2 instances** - Accidentally running both production and staging without --env flag

### **Solution Procedure**

#### **Step 1: Identify Processes Using Ports**

```bash
# Check all relevant ports
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :3002
sudo lsof -i :8088

# Alternative command
sudo netstat -tulpn | grep -E '3000|3001|3002|8088'

# Example output:
# COMMAND   PID     USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
# node      12345   ubuntu 21u  IPv6   123456  0t0     TCP *:3001 (LISTEN)
```

#### **Step 2: Kill Zombie Processes**

```bash
# Kill specific process by PID
kill -9 12345

# Kill all node processes (NUCLEAR OPTION - use with caution!)
killall -9 node

# Kill all PM2-managed processes
pm2 kill
```

#### **Step 3: Clean PM2 State**

```bash
# Stop all PM2 processes
pm2 stop all

# Delete all PM2 processes
pm2 delete all

# Verify clean state
pm2 list
# Should show: "No process"

# Clear PM2 logs
pm2 flush
```

#### **Step 4: Restart Correctly**

```bash
# Start ONLY the environment you need
pm2 start ecosystem.config.js --env production

# Verify it's running
pm2 list
pm2 logs prod-api --lines 20

# Check the health endpoint
curl http://localhost:3001/health
```

### **Prevention Checklist**

- [ ] **ALWAYS** use `--env production` or `--env staging` flag
- [ ] **NEVER** run `pm2 start ecosystem.config.js` without --env flag
- [ ] **VERIFY** ports are free before starting: `sudo lsof -i :3001`
- [ ] **CLEAN** PM2 state before major changes: `pm2 delete all`
- [ ] **CHECK** logs after starting: `pm2 logs`

---

## 📦 **Complete Deployment Procedures**

### **First-Time Setup**

```bash
# 1. Clone repository
git clone https://github.com/your-repo/real-estate-system.git
cd real-estate-system

# 2. Install dependencies
npm run install:all

# 3. Build applications
npm run build:all

# 4. Verify environment files exist
ls -la api/.env.production api/.env.development
ls -la Web/.env.production Web/.env.development

# 5. Install PM2 globally (if not already installed)
npm install -g pm2

# 6. Start production environment
pm2 start ecosystem.config.js --env production

# 7. Save PM2 configuration
pm2 save

# 8. Setup PM2 to start on boot
pm2 startup
# Follow the instructions printed

# 9. Verify health
curl http://localhost:3001/health
curl http://localhost:3000
```

### **Production Deployment**

```bash
# 1. Pull latest code
git pull origin main

# 2. Install new dependencies (if any)
cd api && npm install && cd ..
cd Web && npm install && cd ..

# 3. Build applications
npm run build:all

# 4. Restart production processes
pm2 restart prod-api
pm2 restart prod-frontend

# 5. Verify deployment
pm2 logs --lines 50
curl http://localhost:3001/health

# 6. Monitor for issues
pm2 monit
```

### **Staging Deployment**

```bash
# 1. Pull latest code from develop branch
git pull origin develop

# 2. Install dependencies
npm run install:all

# 3. Build applications
npm run build:all

# 4. Start or restart staging
pm2 restart staging-api || pm2 start ecosystem.config.js --env staging --only staging-api
pm2 restart staging-frontend || pm2 start ecosystem.config.js --env staging --only staging-frontend

# 5. Verify
curl http://localhost:3002/health
curl http://localhost:3002/api/docs  # Swagger UI
```

### **Rollback Procedure**

```bash
# 1. Stop affected processes
pm2 stop prod-api prod-frontend

# 2. Checkout previous version
git log --oneline -5  # Find the commit hash
git checkout <previous-commit-hash>

# 3. Rebuild
npm run build:all

# 4. Restart processes
pm2 restart prod-api prod-frontend

# 5. Verify rollback
pm2 logs --lines 50
curl http://localhost:3001/health
```

---

## 📚 **Environment Variable Reference**

### **Critical Variables**

| Variable | Purpose | Production | Staging |
|----------|---------|------------|---------|
| `NODE_ENV` | Environment identifier | `production` | `development` |
| `PORT` | API server port | `3001` | `3002` |
| `SUPABASE_URL` | Database connection | Prod instance | Staging instance |
| `JWT_SECRET` | Token signing | Strong random | Dev secret |
| `ALLOWED_ORIGINS` | CORS whitelist | Production domains | localhost |

### **Port Configuration Priority**

The system uses the following priority for port selection:

```javascript
// Backend (api/src/config/configuration.ts)
port: parseInt(
  isProduction 
    ? (process.env.PROD_API_PORT || process.env.PORT || '3001')
    : (process.env.STAGING_API_PORT || process.env.PORT || '3002'),
  10
)
```

**Priority Order:**
1. Environment-specific variable (`PROD_API_PORT` or `STAGING_API_PORT`)
2. Generic `PORT` variable
3. Hardcoded fallback (`3001` or `3002`)

---

## ❤️ **Health Checks & Monitoring**

### **Health Check Endpoints**

```bash
# Production API
curl http://localhost:3001/health

# Response:
{
  "status": "ok",
  "timestamp": "2025-11-12T12:00:00.000Z",
  "environment": "production",
  "port": 3001
}

# Staging API
curl http://localhost:3002/health

# Response:
{
  "status": "ok",
  "timestamp": "2025-11-12T12:00:00.000Z",
  "environment": "development",
  "port": 3002
}
```

### **Monitoring Commands**

```bash
# CPU and Memory usage
pm2 monit

# Process metrics
pm2 describe prod-api

# Application logs
pm2 logs prod-api --lines 100

# Check if port is listening
netstat -tuln | grep 3001

# Check process uptime
pm2 list
```

### **Automated Health Check Script**

```bash
#!/bin/bash
# health-check.sh

echo "🔍 Checking Production Environment..."
curl -f http://localhost:3001/health || echo "❌ Production API is down!"
curl -f http://localhost:3000 || echo "❌ Production Frontend is down!"

echo ""
echo "🔍 Checking Staging Environment..."
curl -f http://localhost:3002/health || echo "❌ Staging API is down!"
curl -f http://localhost:8088 || echo "❌ Staging Frontend is down!"

echo ""
echo "📊 PM2 Status:"
pm2 list
```

---

## 🎯 **Quick Reference Commands**

```bash
# PRODUCTION
pm2 start ecosystem.config.js --env production    # Start
pm2 restart prod-api prod-frontend                # Restart
pm2 stop prod-api prod-frontend                   # Stop
pm2 logs prod-api                                 # View logs

# STAGING
pm2 start ecosystem.config.js --env staging       # Start
pm2 restart staging-api staging-frontend          # Restart
pm2 stop staging-api staging-frontend             # Stop
pm2 logs staging-api                              # View logs

# TROUBLESHOOTING
sudo lsof -i :3001                                # Check port
kill -9 <PID>                                     # Kill process
pm2 delete all                                    # Clean PM2
pm2 flush                                         # Clear logs

# MONITORING
pm2 list                                          # List all
pm2 monit                                         # Monitor
curl http://localhost:3001/health                 # Health check
```

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**

- [ ] Code reviewed and merged to main/develop
- [ ] All tests passing
- [ ] Environment files verified
- [ ] Build successful locally
- [ ] Database migrations completed

### **Deployment**

- [ ] Pull latest code
- [ ] Install dependencies
- [ ] Build applications
- [ ] Restart PM2 processes with correct --env flag
- [ ] Verify health endpoints
- [ ] Check PM2 logs for errors
- [ ] Test critical user flows

### **Post-Deployment**

- [ ] Monitor logs for 5-10 minutes
- [ ] Check error logs: `pm2 logs --err`
- [ ] Verify database connections
- [ ] Test API endpoints
- [ ] Confirm frontend loads correctly
- [ ] Check performance metrics
- [ ] Document any issues

---

## 🆘 **Emergency Contacts & Resources**

### **Common Issues**

| Issue | Solution | Command |
|-------|----------|---------|
| Port in use | Kill process | `sudo lsof -i :<port>` then `kill -9 <PID>` |
| PM2 not starting | Clean state | `pm2 delete all && pm2 flush` |
| Wrong environment | Restart with --env | `pm2 restart <app> --env <environment>` |
| High memory usage | Restart app | `pm2 restart <app>` |
| Process crashed | Check logs | `pm2 logs <app> --err` |

### **Log Locations**

```
/workspace/logs/
├── prod-api-error.log         # Production API errors
├── prod-api-out.log           # Production API output
├── prod-frontend-error.log    # Production frontend errors
├── prod-frontend-out.log      # Production frontend output
├── staging-api-error.log      # Staging API errors
├── staging-api-out.log        # Staging API output
├── staging-frontend-error.log # Staging frontend errors
└── staging-frontend-out.log   # Staging frontend output
```

---

**Last Updated:** November 12, 2025  
**Version:** 2.0  
**Maintained By:** DevOps Team
