# 🎯 **دليل البورتات المركزية - Centralized Ports Guide**

**طريقة واحدة لتغيير كل البورتات من مكان واحد!**

---

## ✅ **كيف تغير البورتات**

### **الخطوة 1: غيّر في ecosystem.config.js فقط**

افتح الملف:
```bash
nano /var/www/Website/ecosystem.config.js
```

**غيّر هنا فقط (أول الملف):**

```javascript
const PORTS = {
  PRODUCTION: {
    API: 3031,      // ← غير هنا! Production API Port
    FRONTEND: 3000, // ← غير هنا! Production Frontend Port
  },
  STAGING: {
    API: 3032,      // ← Staging API Port
    FRONTEND: 8088, // ← Staging Frontend Port
  }
};
```

**احفظ الملف:** `Ctrl+O` ثم `Enter` ثم `Ctrl+X`

---

### **الخطوة 2: شغّل السكريبت التلقائي**

```bash
cd /var/www/Website

# السكريبت يسوي كل شيء تلقائياً:
# - يقرأ البورتات من ecosystem.config.js
# - يحدث .env files
# - يعيد بناء Frontend
# - يشغل PM2
bash scripts/deploy-with-ports.sh
```

**خلاص! كل شيء يتحدث تلقائياً!** ✅

---

## 🔄 **كيف يشتغل النظام**

```
┌─────────────────────────────────────────────────────┐
│         ecosystem.config.js (المصدر الوحيد)         │
│                                                      │
│  const PORTS = {                                    │
│    PRODUCTION: { API: 3031, FRONTEND: 3000 }       │
│  }                                                   │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
      ↓                         ↓
┌─────────────────┐   ┌─────────────────────┐
│ deploy script   │   │   PM2 env blocks    │
│ يقرأ البورتات   │   │ تمرر البورتات       │
└────────┬────────┘   └─────────┬───────────┘
         │                      │
         ↓                      ↓
┌─────────────────┐   ┌─────────────────────┐
│ .env.production │   │   PM2 processes     │
│ (Frontend)      │   │   PORT=3031         │
│ API_URL=:3031   │   │                     │
└────────┬────────┘   └─────────────────────┘
         │
         ↓
┌─────────────────┐
│  npm run build  │
│ (يحفظ القيم)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  JavaScript     │
│  Bundles        │
│  (3031) ✅      │
└─────────────────┘
```

---

## 📋 **على السيرفر - نفذ الآن:**

```bash
cd /var/www/Website

# سحب آخر كود
git pull origin develop

# تشغيل السكريبت التلقائي
bash scripts/deploy-with-ports.sh
```

**السكريبت يسوي:**
1. ✅ يقرأ البورت 3031 من ecosystem.config.js
2. ✅ يكتبه في Web/.env.production
3. ✅ يكتبه في api/.env.production  
4. ✅ يحدث CORS تلقائياً
5. ✅ يعيد بناء Frontend (يحفظ 3031 في الـ bundles)
6. ✅ يشغل PM2

---

## ✅ **النتيجة المتوقعة**

بعد تشغيل السكريبت، في المتصفح:

```
✅ POST http://64.227.166.229:3031/api/auth/login
```

مو 3001! 🎯

---

**نفذ الأوامر فوق الآن!** 🚀