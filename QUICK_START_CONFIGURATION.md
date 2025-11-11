# ⚡ Quick Start - Configuration Setup

**Time Required:** 5 minutes  
**Difficulty:** Easy  
**Prerequisites:** SSH access to server, Supabase account

---

## 🚀 Setup in 4 Steps

### Step 1: Configure Environment (2 minutes)

```bash
cd /workspace/api

# Edit development environment
nano .env.development
# Required: Update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# Edit production environment
nano .env.production
# Required: Update SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JWT_SECRET
```

**Get Supabase credentials:**
1. Go to https://app.supabase.com
2. Settings → API
3. Copy "Project URL" and "service_role key"

**Generate JWT Secret (production):**
```bash
openssl rand -base64 32
```

---

### Step 2: Build Backend (1 minute)

```bash
cd /workspace/api
npm install
npm run build
```

---

### Step 3: Create First Admin (1 minute)

```bash
cd /workspace/api
npm run seed:superadmin -- \
  --email="admin@yourdomain.com" \
  --password="YourSecurePassword123!" \
  --name="Admin Name"
```

**Success looks like:**
```
✅ SuperAdmin User Created Successfully!
```

---

### Step 4: Start Application (1 minute)

**Development Mode:**
```bash
pm2 start ecosystem.config.js --only dev-api,dev-frontend
```

**Production Mode:**
```bash
pm2 start ecosystem.config.js --only prod-api,prod-frontend
```

**Verify:**
```bash
pm2 list
curl http://localhost:3001/health  # Dev
curl http://localhost:3002/health  # Prod
```

---

## ✅ You're Done!

**Development:**
- Backend: http://localhost:3001
- Frontend: http://localhost:8088
- Swagger: http://localhost:3001/api/docs

**Production:**
- Backend: http://localhost:3002
- Frontend: http://localhost:3000

---

## 📚 Full Documentation

For detailed information, see:
- **English:** `/workspace/Project_Documentation/EN/Initial_Setup_Guide.md`
- **Arabic:** `/workspace/Project_Documentation/AR/Initial_Setup_Guide_AR.md`
- **Sprint Summary:** `/workspace/CONFIGURATION_UNIFICATION_COMPLETE.md`

---

## 🆘 Quick Troubleshooting

**"Port already in use"**
```bash
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js --only dev-api,dev-frontend
```

**"Cannot connect to Supabase"**
- Check SUPABASE_URL starts with `https://`
- Verify SUPABASE_SERVICE_ROLE_KEY is complete (very long string)

**"User already exists"**
- Use a different email OR delete from database:
  ```sql
  DELETE FROM users WHERE email = 'admin@yourdomain.com';
  ```

---

**Need Help?** Check the full documentation or logs:
```bash
pm2 logs
```
