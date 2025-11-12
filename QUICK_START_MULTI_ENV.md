# ⚡ **Quick Start: Multi-Environment Setup**

**Get your production and staging environments running in 5 minutes!**

---

## 🎯 **Prerequisites**

```bash
# 1. Ensure PM2 is installed
npm install -g pm2

# 2. Verify Node.js version
node --version  # Should be v18+ or v20+

# 3. Verify project is built
npm run build:all
```

---

## 🚀 **Start Production Environment**

```bash
# Step 1: Check if ports are available
sudo lsof -i :3000 -i :3001

# Step 2: Start production
pm2 start ecosystem.config.js --env production

# Step 3: Verify it's running
pm2 list
pm2 logs prod-api --lines 20

# Step 4: Test health
curl http://localhost:3001/health

# Expected output:
# {
#   "status": "ok",
#   "environment": "production",
#   "port": 3001
# }

# Step 5: Access applications
# API:      http://localhost:3001/api
# Frontend: http://localhost:3000
```

---

## 🧪 **Start Staging Environment**

```bash
# Step 1: Check if ports are available
sudo lsof -i :3002 -i :8088

# Step 2: Start staging
pm2 start ecosystem.config.js --env staging

# Step 3: Verify it's running
pm2 list
pm2 logs staging-api --lines 20

# Step 4: Test health
curl http://localhost:3002/health

# Expected output:
# {
#   "status": "ok",
#   "environment": "development",
#   "port": 3002
# }

# Step 5: Access applications
# API:      http://localhost:3002/api
# Frontend: http://localhost:8088
# Swagger:  http://localhost:3002/api/docs
```

---

## 🔧 **Quick Troubleshooting**

### **Error: EADDRINUSE (Port already in use)**

```bash
# Solution 1: Kill the process
sudo lsof -i :3001  # Find the PID
kill -9 <PID>

# Solution 2: Clean PM2
pm2 delete all
pm2 start ecosystem.config.js --env production
```

### **Error: PM2 command not found**

```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 start ecosystem.config.js --env production
```

### **Error: Application not starting**

```bash
# Check the logs
pm2 logs prod-api --err

# Common issues:
# 1. .env.production file missing
# 2. Build files missing (run npm run build:all)
# 3. Port already in use
```

---

## 📊 **Verify Everything**

```bash
# Use the automated health check script
bash scripts/health-check.sh

# Or check manually
curl http://localhost:3001/health  # Production API
curl http://localhost:3002/health  # Staging API
curl http://localhost:3000         # Production Frontend
curl http://localhost:8088         # Staging Frontend

# Check PM2 status
pm2 list
pm2 monit
```

---

## 🎮 **Common Commands**

```bash
# RESTART
pm2 restart prod-api          # Restart production API
pm2 restart all               # Restart everything

# STOP
pm2 stop prod-api             # Stop production API
pm2 stop all                  # Stop everything

# LOGS
pm2 logs                      # All logs (live)
pm2 logs prod-api             # Specific app logs
pm2 logs --err                # Only errors

# DELETE
pm2 delete prod-api           # Delete production API
pm2 delete all                # Delete everything
```

---

## ✅ **Success Checklist**

After starting, verify:

- [ ] `pm2 list` shows 2 processes (for production) or 4 (for both)
- [ ] All processes show status: `online`
- [ ] Health endpoint responds: `curl http://localhost:3001/health`
- [ ] Frontend loads: `curl http://localhost:3000`
- [ ] No errors in logs: `pm2 logs --err`

---

## 🆘 **Need Help?**

1. **Check the detailed guide:** `MULTI_ENVIRONMENT_DEPLOYMENT_GUIDE.md`
2. **Verify ports:** `bash scripts/verify-ports.sh`
3. **Run health check:** `bash scripts/health-check.sh`
4. **View error logs:** `pm2 logs --err`
5. **Nuclear option (last resort):**
   ```bash
   pm2 kill
   sudo killall node
   pm2 start ecosystem.config.js --env production
   ```

---

**🎉 You're all set! Your multi-environment architecture is now running.**
