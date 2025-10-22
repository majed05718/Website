# 🚀 دليل الإصلاح السريع - Real Estate Management

> **آخر تحديث:** 2025-10-22  
> **الوقت المتوقع:** 15-20 دقيقة

---

## 🔴 المشكلة المكتشفة

المشروع **لا يعمل** على الإطلاق بسبب:

1. ❌ **Dependencies غير مثبتة** (جميع npm packages مفقودة)
2. ❌ **Build غير موجود** (Backend و Frontend غير compiled)
3. ❌ **Environment Variables مفقودة** (.env files غير موجودة)
4. ❌ **PM2 يعيد التشغيل باستمرار** (لأنه يحاول تشغيل ملفات غير موجودة)

---

## ✅ الحل السريع

### الطريقة الأولى: السكريبت التلقائي (موصى بها)

```bash
cd /workspace
./fix-production.sh
```

هذا السكريبت سيقوم بـ:
- ✅ تثبيت PM2
- ✅ تثبيت جميع Dependencies
- ✅ إنشاء .env files (ستحتاج لملئها)
- ✅ Build Backend و Frontend
- ✅ إعادة تشغيل PM2

**مدة التنفيذ:** ~15 دقيقة

---

### الطريقة الثانية: يدوياً (خطوة بخطوة)

#### 1️⃣ تثبيت PM2
```bash
sudo npm install -g pm2
pm2 --version
```

#### 2️⃣ Backend Setup
```bash
cd /workspace/api

# تثبيت dependencies
npm install

# إنشاء .env
cp .env.example .env
nano .env  # أو vim .env

# Build
npm run build

cd ..
```

#### 3️⃣ Frontend Setup
```bash
cd /workspace/Web

# تثبيت dependencies
npm install

# إنشاء .env.local
cp .env.example .env.local
nano .env.local  # أو vim .env.local

# Build
npm run build

cd ..
```

#### 4️⃣ تشغيل PM2
```bash
cd /workspace

pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

---

## 📝 Environment Variables المطلوبة

### Backend (api/.env)
```bash
NODE_ENV=production
PORT=3001

# من Supabase Dashboard: https://app.supabase.com/project/_/settings/api
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# أنشئه بـ: openssl rand -base64 32
JWT_SECRET=your-random-secret-here

# استبدل YOUR_SERVER_IP بالـ IP الفعلي
ALLOWED_ORIGINS=http://YOUR_SERVER_IP,http://YOUR_SERVER_IP:3000
```

### Frontend (Web/.env.local)
```bash
NODE_ENV=production

# استبدل YOUR_SERVER_IP بالـ IP الفعلي
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001

NEXT_PUBLIC_ENV=production
```

---

## 🔍 التحقق من التشغيل

```bash
# 1. حالة PM2
pm2 status

# يجب أن ترى:
# backend:  status = online, restart = 0
# frontend: status = online, restart = 0

# 2. فحص Backend
curl http://localhost:3001/health

# يجب أن ترى:
# {"status":"ok","timestamp":"...","environment":"production","port":3001}

# 3. فحص Frontend
curl http://localhost:3000

# يجب أن ترى HTML content

# 4. فحص Logs
pm2 logs --lines 50
```

---

## ❌ حل المشاكل الشائعة

### Backend يعيد التشغيل؟
```bash
# تحقق من Logs
pm2 logs backend --lines 100

# إذا رأيت "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
# راجع api/.env وتأكد من ملء القيم

# إذا رأيت "Cannot find module..."
cd /workspace/api && npm install
```

### Frontend يعيد التشغيل؟
```bash
# تحقق من Logs
pm2 logs frontend --lines 100

# إذا رأيت "Could not find a production build"
cd /workspace/Web && npm run build

# إذا رأيت "ECONNREFUSED localhost:3001"
# Backend لا يعمل - أصلح Backend أولاً
```

### CORS Errors في Browser؟
```bash
# تأكد من ALLOWED_ORIGINS في api/.env
cat /workspace/api/.env | grep ALLOWED_ORIGINS

# يجب أن يحتوي على frontend URL:
# ALLOWED_ORIGINS=http://YOUR_SERVER_IP,http://YOUR_SERVER_IP:3000
```

---

## 📊 أوامر PM2 المفيدة

```bash
pm2 status              # حالة العمليات
pm2 logs                # جميع logs
pm2 logs backend        # backend logs فقط
pm2 logs frontend       # frontend logs فقط
pm2 monit               # مراقبة real-time
pm2 restart all         # إعادة تشغيل الكل
pm2 reload all          # reload بدون downtime
pm2 stop all            # إيقاف الكل
```

---

## 📖 المراجع

- **التقرير الشامل:** `COMPREHENSIVE_ANALYSIS_REPORT.md`
- **سكريبت الإصلاح:** `fix-production.sh`
- **الوثائق:** `API_USAGE_GUIDE.md`, `DEPLOYMENT.md`

---

## ✅ Checklist سريع

قبل البدء:
- [ ] أنت في `/workspace`
- [ ] لديك صلاحيات sudo
- [ ] لديك معلومات Supabase

بعد التنفيذ:
- [ ] `pm2 status` يعرض online
- [ ] Restart count = 0 أو قليل جداً
- [ ] `curl localhost:3001/health` يعمل
- [ ] `curl localhost:3000` يعمل
- [ ] لا يوجد errors في `pm2 logs`

---

**🎯 الهدف:** Backend + Frontend يعملان بدون restarts في أقل من 20 دقيقة!
