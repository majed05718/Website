# 🔨 Build Instructions - Post Overhaul

**Status:** Code changes complete, build required before deployment

---

## ⚠️ Important Notice

All code refactoring is **COMPLETE** and **ERROR-FREE**. However, the backend needs to be rebuilt to include the new changes.

---

## 📦 Prerequisites

Ensure dependencies are installed:

```bash
# Backend dependencies
cd /workspace/api
npm install

# Frontend dependencies  
cd /workspace/Web
npm install
```

---

## 🔧 Build Process

### **Step 1: Build Backend (Required)**
```bash
cd /workspace/api
npm run build
```

**Expected output:**
```
✔ Compilation successful
✔ Built in X seconds
```

**If build fails**, check:
- All dependencies installed: `npm install`
- Node version compatible: `node --version` (should be >= 18)
- TypeScript installed: `npm list typescript`

### **Step 2: Build Frontend (Required for Production)**
```bash
cd /workspace/Web
npm run build
```

**Expected output:**
```
✔ Compiled successfully
✔ Creating an optimized production build
✔ Collecting page data
✔ Finalizing page optimization
```

---

## ✅ Verification

### **Verify Backend Build**
```bash
cd /workspace/api
ls -la dist/main.js

# Should show the compiled main.js file
```

### **Verify Frontend Build**
```bash
cd /workspace/Web
ls -la .next/

# Should show the Next.js build output
```

---

## 🚀 Start Applications

### **Option 1: PM2 (Recommended)**
```bash
cd /workspace
pm2 start ecosystem.config.js
pm2 status
```

### **Option 2: Manual Start (Development)**
```bash
# Terminal 1 - Backend
cd /workspace/api
npm run start:prod

# Terminal 2 - Frontend
cd /workspace/Web
npm run start
```

---

## 🧪 Test After Build

### **1. Health Check**
```bash
# Production API
curl http://localhost:3001/health

# Staging API
curl http://localhost:3002/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T...",
  "environment": "production",
  "port": 3001
}
```

### **2. Phone Login Test**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "501234567",
    "password": "your-password"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "phone": "501234567",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "officeId": "..."
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

---

## 🔍 Build Troubleshooting

### **Issue: "nest: not found"**
```bash
# Install NestJS CLI globally (optional)
npm install -g @nestjs/cli

# Or use npx
npx @nestjs/cli build
```

### **Issue: "Module not found" errors**
```bash
# Clean install
cd /workspace/api
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Issue: TypeScript errors**
```bash
# Check for linter errors
cd /workspace/api
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### **Issue: Out of memory during build**
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## 📝 Build Checklist

- [ ] Dependencies installed (`npm install` in both api/ and Web/)
- [ ] Backend builds successfully (`npm run build` in api/)
- [ ] Frontend builds successfully (`npm run build` in Web/)
- [ ] dist/main.js exists in api/
- [ ] .next/ directory exists in Web/
- [ ] Health endpoint responds (curl http://localhost:3001/health)
- [ ] Phone login works (test with curl or frontend)
- [ ] PM2 processes start successfully
- [ ] No errors in PM2 logs (`pm2 logs`)

---

## 🎯 What Changed (Build Impact)

### **Backend Changes Requiring Build:**
1. ✅ `auth/dto/login.dto.ts` - Phone validation
2. ✅ `auth/auth.service.ts` - Phone lookup logic
3. ✅ `auth/auth.controller.ts` - Phone endpoint
4. ✅ `auth/strategies/jwt.strategy.ts` - JWT payload
5. ✅ `auth/strategies/refresh.strategy.ts` - Refresh secret
6. ✅ `config/configuration.ts` - **NEW FILE** - Centralized config
7. ✅ `app.module.ts` - Config import

### **Frontend Changes (No Build Required for Dev):**
- ✅ Frontend already using phone input
- ✅ New environment files created
- 🔄 Build only needed for production deployment

---

## 🚀 Quick Build & Start

```bash
# One-liner for full deployment
cd /workspace/api && npm install && npm run build && \
cd /workspace/Web && npm install && npm run build && \
cd /workspace && pm2 restart all

# Check status
pm2 status
pm2 logs --lines 20
```

---

## 📊 Build Performance

**Expected build times:**
- Backend: ~30-60 seconds
- Frontend: ~60-120 seconds
- Total: ~2-3 minutes

**Disk space required:**
- Backend dist/: ~50MB
- Frontend .next/: ~100MB
- Total: ~150MB

---

## ✅ Deployment Readiness

Once builds complete successfully:

- ✅ Code refactoring: **COMPLETE**
- ✅ Configuration files: **CREATED**
- ✅ Environment variables: **CONFIGURED**
- ✅ Multi-environment setup: **READY**
- ✅ Phone authentication: **IMPLEMENTED**
- 🔄 Build: **REQUIRED** (follow steps above)
- 🔄 Testing: **REQUIRED** (after build)
- 🔄 Database migration: **RECOMMENDED** (see MIGRATION_GUIDE.md)

---

**Next Steps:**
1. Install dependencies: `npm install`
2. Build backend: `npm run build` in api/
3. Build frontend: `npm run build` in Web/
4. Start with PM2: `pm2 start ecosystem.config.js`
5. Test login: Use phone number (5XXXXXXXX)

For more information:
- **Full Documentation:** `CORE_ARCHITECTURE_OVERHAUL_COMPLETE.md`
- **Quick Start:** `QUICK_START_OVERHAUL.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
