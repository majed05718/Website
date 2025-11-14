# 🚀 Quick Start Guide - Core Architecture Overhaul

**Last Updated:** 2025-11-12

---

## ⚡ Quick Commands

### **Rebuild Backend (Required After Changes)**
```bash
cd /workspace/api
npm run build
```

### **Start All Environments**
```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs
```

### **Start Production Only**
```bash
pm2 start ecosystem.config.js --only prod-api,prod-frontend
```

### **Start Staging Only**
```bash
pm2 start ecosystem.config.js --only staging-api,staging-frontend
```

---

## 🔐 Test Phone-Based Login

### **Frontend (Browser)**
1. Navigate to: `http://localhost:8088` (staging)
2. Enter phone: `501234567` (must start with 5, 9 digits total)
3. Enter your password
4. Click login

### **Backend API (curl)**
```bash
# Staging API (Port 3002)
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "501234567",
    "password": "your-password"
  }'

# Production API (Port 3001)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "501234567",
    "password": "your-password"
  }'
```

---

## 🌐 Environment URLs

| Environment | API | Frontend |
|-------------|-----|----------|
| **Production** | http://localhost:3001/api | http://localhost:3000 |
| **Staging** | http://localhost:3002/api | http://localhost:8088 |

---

## 📋 Pre-Deployment Checklist

### **1. Update Production Secrets**
Edit `/workspace/api/.env.production`:
```bash
# Generate new secrets:
openssl rand -base64 32

# Update these in .env.production:
PROD_JWT_SECRET=<generated-secret-1>
PROD_JWT_REFRESH_SECRET=<generated-secret-2>
```

### **2. Update Production Domain**
Edit `/workspace/api/.env.production`:
```bash
ALLOWED_ORIGINS_PROD=https://your-domain.com,https://www.your-domain.com
```

Edit `/workspace/Web/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_BACKEND_URL=https://your-domain.com
```

### **3. Build Frontend**
```bash
cd /workspace/Web
npm run build
```

### **4. Build Backend**
```bash
cd /workspace/api
npm run build
```

### **5. Start with PM2**
```bash
cd /workspace
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔧 Troubleshooting

### **Issue: Port Already in Use**
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3002

# Kill the process
kill -9 <PID>
```

### **Issue: Module Not Found**
```bash
# Backend
cd /workspace/api
npm install

# Frontend
cd /workspace/Web
npm install
```

### **Issue: Build Errors**
```bash
# Clean and rebuild backend
cd /workspace/api
rm -rf dist
npm run build

# Clean and rebuild frontend
cd /workspace/Web
rm -rf .next
npm run build
```

### **Issue: Environment Variables Not Loading**
```bash
# Verify files exist
ls -la /workspace/api/.env*
ls -la /workspace/Web/.env*

# Restart PM2 processes
pm2 restart all

# Check logs
pm2 logs prod-api --lines 50
```

---

## 📊 Monitoring

### **View All Processes**
```bash
pm2 status
```

### **View Logs**
```bash
# All logs
pm2 logs

# Specific process
pm2 logs prod-api
pm2 logs staging-frontend

# Last 100 lines
pm2 logs --lines 100
```

### **Real-Time Monitoring**
```bash
pm2 monit
```

### **Process Details**
```bash
pm2 describe prod-api
```

---

## 🛑 Stopping Services

### **Stop All**
```bash
pm2 stop all
```

### **Stop Production**
```bash
pm2 stop prod-api
pm2 stop prod-frontend
```

### **Stop Staging**
```bash
pm2 stop staging-api
pm2 stop staging-frontend
```

### **Delete All Processes**
```bash
pm2 delete all
```

---

## 🔄 Updates & Restarts

### **After Code Changes**
```bash
# Backend changes
cd /workspace/api
npm run build
pm2 restart prod-api staging-api

# Frontend changes
cd /workspace/Web
npm run build
pm2 restart prod-frontend staging-frontend
```

### **After Environment Variable Changes**
```bash
# Just restart (PM2 will reload .env files)
pm2 restart all
```

---

## 📦 PM2 Persistence

### **Save Current Configuration**
```bash
pm2 save
```

### **Enable Auto-Start on Boot**
```bash
pm2 startup
# Copy and run the command it outputs
```

### **Disable Auto-Start**
```bash
pm2 unstartup
```

---

## 🎯 Key Changes Summary

### **Authentication**
- ✅ Login now uses **phone number** instead of email
- ✅ Phone format: `5XXXXXXXX` (9 digits starting with 5)
- ✅ Backend validates: `^5[0-9]{8}$`
- ✅ Frontend has matching validation

### **Environment Configuration**
- ✅ Production uses: `.env.production` files
- ✅ Staging uses: `.env.development` files
- ✅ Each environment has unique ports
- ✅ Each environment has unique JWT secrets
- ✅ Complete isolation between environments

### **Port Allocation**
- **Production API:** 3001
- **Production Frontend:** 3000
- **Staging API:** 3002
- **Staging Frontend:** 8088

---

## 📞 Support

For detailed information, see:
- **Full Documentation:** `/workspace/CORE_ARCHITECTURE_OVERHAUL_COMPLETE.md`
- **Configuration Details:** `/workspace/api/src/config/configuration.ts`
- **Ecosystem Config:** `/workspace/ecosystem.config.js`

---

**Ready to Deploy! 🚀**
