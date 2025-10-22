# 📜 Deployment Scripts

مجموعة من Scripts لإدارة ونشر المشروع على السيرفر.

---

## 📋 قائمة Scripts

### 1. `first-deploy.sh` - أول نشر

**الاستخدام:**
```bash
./scripts/first-deploy.sh
```

**الوظيفة:**
- التحقق من ملفات environment
- تثبيت dependencies (Backend + Frontend)
- بناء المشروع
- إنشاء PM2 configuration
- بدء الخدمات
- حفظ إعدادات PM2

**متى تستخدمه:**
- عند أول نشر للمشروع على سيرفر جديد
- بعد clone المشروع من Git

---

### 2. `deploy.sh` - نشر التحديثات

**الاستخدام:**
```bash
./scripts/deploy.sh
```

**الوظيفة:**
- جلب آخر التحديثات من Git
- تثبيت dependencies الجديدة
- بناء Backend و Frontend
- إعادة تشغيل الخدمات
- فحص صحة الخدمات

**متى تستخدمه:**
- عند وجود تحديثات جديدة
- بعد push تغييرات إلى Git
- بشكل منتظم للتحديثات

---

### 3. `logs.sh` - عرض Logs

**الاستخدام:**
```bash
./scripts/logs.sh
```

**الخيارات:**
1. Backend logs
2. Frontend logs
3. Both (combined)
4. PM2 status
5. Backend errors only
6. Frontend errors only
7. Live tail (real-time)

**متى تستخدمه:**
- عند تشخيص مشاكل
- لمراقبة النظام
- لعرض errors

---

### 4. `health-check.sh` - فحص الصحة

**الاستخدام:**
```bash
./scripts/health-check.sh
```

**يفحص:**
- ✅ Backend API
- ✅ Frontend
- ✅ PM2 Processes
- ✅ Nginx
- ✅ Disk Usage
- ✅ Memory Usage

**متى تستخدمه:**
- بعد النشر للتأكد من نجاحه
- بشكل منتظم للمراقبة
- عند الشك في وجود مشاكل

---

### 5. `make-executable.sh` - جعل Scripts قابلة للتنفيذ

**الاستخدام:**
```bash
./scripts/make-executable.sh
```

**الوظيفة:**
- إعطاء صلاحيات التنفيذ لجميع scripts

**متى تستخدمه:**
- بعد clone المشروع
- إذا لم تعمل scripts

---

## 🔄 سير العمل المعتاد

### أول مرة (Setup):

```bash
# 1. Clone المشروع
git clone <repo-url>
cd project

# 2. إعداد environment
cp api/.env.example api/.env
cp Web/.env.example Web/.env.local
nano api/.env          # عدّل القيم
nano Web/.env.local    # عدّل القيم

# 3. أول نشر
chmod +x scripts/*.sh
./scripts/first-deploy.sh

# 4. فحص الصحة
./scripts/health-check.sh
```

### تحديثات منتظمة:

```bash
# 1. نشر التحديثات
./scripts/deploy.sh

# 2. فحص الصحة
./scripts/health-check.sh

# 3. عرض logs (إذا لزم)
./scripts/logs.sh
```

### تشخيص مشاكل:

```bash
# 1. فحص الصحة
./scripts/health-check.sh

# 2. عرض logs
./scripts/logs.sh

# 3. PM2 status
pm2 status

# 4. عرض errors محددة
pm2 logs backend --err --lines 50
```

---

## ⚠️ ملاحظات مهمة

### 1. Environment Files

تأكد من وجود:
- `api/.env`
- `Web/.env.local`

قبل تشغيل أي script.

### 2. Permissions

إذا واجهت خطأ "Permission denied":
```bash
chmod +x scripts/*.sh
```

### 3. Git Repository

`deploy.sh` يستخدم Git لجلب التحديثات، تأكد من:
- وجود Git repository
- الاتصال بـ remote
- عدم وجود uncommitted changes

### 4. PM2

Scripts تفترض وجود PM2 مثبت:
```bash
npm install -g pm2
```

### 5. Node.js Version

تأكد من استخدام Node.js 20.x:
```bash
node --version
```

---

## 🐛 حل المشاكل

### Script لا يعمل

**المشكلة:**
```bash
bash: ./scripts/deploy.sh: Permission denied
```

**الحل:**
```bash
chmod +x scripts/deploy.sh
```

---

### Git pull يفشل

**المشكلة:**
```bash
error: Your local changes to the following files would be overwritten
```

**الحل:**
```bash
git stash
./scripts/deploy.sh
```

---

### npm install يفشل

**المشكلة:**
```bash
npm ERR! network error
```

**الحل:**
```bash
npm cache clean --force
./scripts/deploy.sh
```

---

### PM2 لا يعمل

**المشكلة:**
```bash
PM2 not found
```

**الحل:**
```bash
npm install -g pm2
./scripts/first-deploy.sh
```

---

## 📞 الدعم

للمزيد من المعلومات، راجع:
- `../DEPLOYMENT.md` - دليل النشر الكامل
- `../PRODUCTION_READY.md` - تفاصيل التغييرات
- GitHub Issues

---

## 📝 إضافة Scripts جديدة

عند إضافة script جديد:

1. أنشئ الملف في `scripts/`:
```bash
nano scripts/new-script.sh
```

2. أضف shebang في البداية:
```bash
#!/bin/bash
```

3. اجعله قابلاً للتنفيذ:
```bash
chmod +x scripts/new-script.sh
```

4. أضف وصفه في هذا README

---

**آخر تحديث:** 2025-10-22
