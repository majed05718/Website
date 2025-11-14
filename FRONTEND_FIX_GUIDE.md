# 🔧 دليل إصلاح مشاكل Frontend

## 📋 المشاكل المكتشفة

### 1. مشكلة البناء (Build)
```
Error: Could not find a production build in the '.next' directory
```
**السبب**: المشروع لم يتم بناؤه قبل تشغيل production server

### 2. مشكلة NODE_ENV
```
⚠ You are using a non-standard "NODE_ENV" value
```
**السبب**: القيمة المستخدمة ليست من القيم القياسية (development, production, test)

---

## ✅ الحل السريع (خطوة واحدة)

### طريقة أوتوماتيكية:

```bash
# تشغيل السكريبت التلقائي
cd /var/www/Website
chmod +x fix-frontend-production.sh
./fix-frontend-production.sh
```

---

## 🔧 الحل اليدوي (خطوة بخطوة)

### الخطوة 1: الانتقال لمجلد Frontend

```bash
cd /var/www/Website/Web
```

### الخطوة 2: تنظيف البناء القديم

```bash
rm -rf .next
```

### الخطوة 3: تعيين NODE_ENV الصحيح

```bash
export NODE_ENV=production
```

### الخطوة 4: بناء المشروع

```bash
npm run build
```

**⏳ ملاحظة**: هذه العملية قد تستغرق 2-5 دقائق

### الخطوة 5: التحقق من البناء

```bash
ls -la .next/
cat .next/BUILD_ID
```

يجب أن ترى ملف `BUILD_ID` موجود

### الخطوة 6: إيقاف PM2 الحالي

```bash
pm2 stop all
pm2 delete all
```

### الخطوة 7: تحديث ملف ecosystem.config.js

تأكد من أن `NODE_ENV` مضبوط على `production`:

```javascript
module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: './Web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 8088',
      env: {
        NODE_ENV: 'production',  // ✅ قيمة صحيحة
        PORT: 8088,
      },
    },
  ],
};
```

### الخطوة 8: إعادة تشغيل PM2

```bash
cd /var/www/Website
pm2 start ecosystem.config.js
pm2 save
```

### الخطوة 9: التحقق من الحالة

```bash
pm2 list
pm2 logs frontend --lines 50
```

---

## 📊 التحقق من نجاح الحل

### 1. التحقق من PM2

```bash
pm2 list
```

يجب أن ترى التطبيق في حالة `online` 🟢

### 2. التحقق من السجلات

```bash
pm2 logs frontend
```

يجب أن ترى:
```
✓ Ready in [X]ms
- Local:    http://localhost:8088
- Network:  http://0.0.0.0:8088
```

### 3. اختبار المتصفح

افتح المتصفح على:
```
http://your-server-ip:8088
```

---

## 🚨 إصلاح المشاكل الشائعة

### مشكلة: Build يفشل

```bash
# تنظيف الكاش
cd /var/www/Website/Web
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### مشكلة: PM2 لا يعمل

```bash
# إعادة تثبيت PM2
npm install -g pm2
pm2 update
```

### مشكلة: البورت مشغول

```bash
# فحص البورت
lsof -i :8088
# أو
netstat -tulpn | grep 8088

# إيقاف العملية
kill -9 [PID]
```

### مشكلة: صلاحيات الملفات

```bash
cd /var/www/Website
sudo chown -R $USER:$USER Web/
chmod -R 755 Web/
```

---

## 📝 ملفات مهمة تم إنشاؤها

1. **fix-frontend-production.sh** - سكريبت الإصلاح التلقائي
2. **ecosystem.config.production.js** - ملف إعدادات PM2 محسّن
3. **FRONTEND_FIX_GUIDE.md** - هذا الدليل

---

## 🔍 فحص شامل

```bash
# سكريبت فحص شامل
echo "=== فحص Frontend ==="
echo ""
echo "1. مجلد .next:"
ls -lh /var/www/Website/Web/.next/BUILD_ID 2>&1

echo ""
echo "2. حالة PM2:"
pm2 list

echo ""
echo "3. NODE_ENV:"
pm2 env frontend | grep NODE_ENV

echo ""
echo "4. البورت:"
netstat -tulpn | grep 8088

echo ""
echo "5. آخر 10 أسطر من السجل:"
pm2 logs frontend --lines 10 --nostream
```

---

## 📞 الأوامر المفيدة

```bash
# مراقبة السجلات مباشرة
pm2 logs frontend

# إعادة تشغيل
pm2 restart frontend

# إيقاف
pm2 stop frontend

# حذف
pm2 delete frontend

# معلومات تفصيلية
pm2 show frontend

# مراقبة الموارد
pm2 monit
```

---

## ✅ خطة الوقاية المستقبلية

### 1. سكريبت نشر جديد

قم بإنشاء `deploy.sh`:

```bash
#!/bin/bash
cd /var/www/Website/Web
git pull
npm install
npm run build
pm2 restart frontend
```

### 2. إعدادات NODE_ENV

**لا تستخدم أبداً**:
- `NODE_ENV=staging` ❌
- `NODE_ENV=prod` ❌
- `NODE_ENV=local` ❌

**استخدم فقط**:
- `NODE_ENV=production` ✅
- `NODE_ENV=development` ✅
- `NODE_ENV=test` ✅

### 3. فحص تلقائي قبل التشغيل

أضف إلى package.json:

```json
{
  "scripts": {
    "prestart": "test -f .next/BUILD_ID || (echo 'Build not found! Run: npm run build' && exit 1)",
    "start": "next start -p 8088"
  }
}
```

---

## 🎯 الملخص

| المشكلة | الحل |
|---------|------|
| مجلد .next غير موجود | `npm run build` |
| NODE_ENV غير قياسي | تعيين `NODE_ENV=production` |
| PM2 يتوقف مباشرة | التأكد من البناء أولاً |
| البورت مشغول | إيقاف العملية القديمة |

---

**🎉 بعد اتباع هذه الخطوات، يجب أن يعمل Frontend بشكل صحيح!**
