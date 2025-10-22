# 🚀 دليل النشر على DigitalOcean

## 📋 المتطلبات

- Ubuntu 24.04 LTS
- Node.js 20.x
- PM2
- Nginx
- Git

## 🎯 خطوات النشر السريعة

### 1. إعداد السيرفر (مرة واحدة)

```bash
# تحديث النظام
apt update && apt upgrade -y

# تثبيت Node.js + PM2
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
npm install -g pm2

# تثبيت Nginx
apt install -y nginx

# Clone المشروع
cd /var/www
git clone https://github.com/majed05718/Website.git property-management
cd property-management
```

### 2. إعداد Environment Variables

```bash
# Backend
cp api/.env.example api/.env
nano api/.env  # عدّل القيم

# Frontend
cp Web/.env.example Web/.env.local
nano Web/.env.local  # عدّل القيم
```

### 3. أول نشر

```bash
chmod +x scripts/*.sh
./scripts/first-deploy.sh
```

### 4. إعداد Nginx

#### إنشاء ملف Configuration

```bash
sudo nano /etc/nginx/sites-available/property-management
```

#### إضافة التكوين التالي:

```nginx
# Upstream servers
upstream backend {
    server localhost:3001;
    keepalive 64;
}

upstream frontend {
    server localhost:3000;
    keepalive 64;
}

# HTTP Server (redirect to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (استخدم Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size
    client_max_body_size 50M;

    # API Routes (Backend)
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health Check
    location /health {
        proxy_pass http://backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### تفعيل Configuration

```bash
# إنشاء symlink
sudo ln -s /etc/nginx/sites-available/property-management /etc/nginx/sites-enabled/

# حذف default site
sudo rm /etc/nginx/sites-enabled/default

# اختبار Configuration
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

### 5. إعداد SSL (Let's Encrypt)

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# تجديد تلقائي (يضاف automaticاً)
sudo certbot renew --dry-run
```

## 🔄 نشر التحديثات

```bash
./scripts/deploy.sh
```

## 📊 المراقبة

```bash
# عرض logs
./scripts/logs.sh

# فحص الصحة
./scripts/health-check.sh

# حالة PM2
pm2 status
```

## 🆘 حل المشاكل

### Backend لا يعمل

```bash
pm2 logs backend --lines 50
pm2 restart backend
```

### Frontend لا يعمل

```bash
pm2 logs frontend --lines 50
pm2 restart frontend
```

### Nginx error

```bash
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Port مستخدم

```bash
# تحقق من Port
sudo lsof -i :3001
sudo lsof -i :3000

# إيقاف العملية
sudo kill -9 [PID]
```

### Memory issues

```bash
# تحقق من الذاكرة
free -h

# إعادة تشغيل PM2
pm2 restart all
```

## 🔧 أوامر مفيدة

### PM2

```bash
# عرض الحالة
pm2 status

# عرض logs
pm2 logs
pm2 logs backend
pm2 logs frontend

# إعادة تشغيل
pm2 restart all
pm2 restart backend
pm2 restart frontend

# إيقاف
pm2 stop all

# حذف
pm2 delete all

# حفظ الحالة
pm2 save

# عرض معلومات
pm2 info backend
```

### Git

```bash
# جلب التحديثات
git pull origin main

# التحقق من الفرع
git branch

# عرض التغييرات
git status
```

### System

```bash
# استخدام الموارد
htop

# استخدام القرص
df -h

# استخدام الذاكرة
free -h

# Nginx status
systemctl status nginx

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

## 📈 تحسينات Production

### 1. Database Connection Pooling

تأكد من إعداد Connection pooling في Supabase:

```typescript
// في supabase.service.ts
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
});
```

### 2. Caching

أضف Redis للـ caching:

```bash
# تثبيت Redis
sudo apt install redis-server

# تفعيل Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 3. Monitoring

استخدم PM2 Plus للمراقبة:

```bash
pm2 link [secret-key] [public-key]
```

### 4. Backup

إنشاء Backup script:

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/property-management"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database (إذا كان local)
# pg_dump database_name > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 🔐 الأمان

### 1. Firewall

```bash
# تثبيت UFW
sudo apt install ufw

# السماح بالـ ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# تفعيل
sudo ufw enable
```

### 2. Fail2Ban

```bash
# تثبيت
sudo apt install fail2ban

# تفعيل
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Environment Variables Security

تأكد من:
- عدم وجود .env في Git
- استخدام strong JWT_SECRET
- تقييد CORS Origins

## 📞 الدعم

- GitHub: https://github.com/majed05718/Website
- Issues: https://github.com/majed05718/Website/issues

## 📝 ملاحظات

1. تأكد من backup قبل كل تحديث
2. اختبر التحديثات في staging قبل production
3. راقب logs بانتظام
4. حافظ على تحديث الـ dependencies

## 🎉 نجاح النشر!

بعد اتباع هذه الخطوات، يجب أن يكون موقعك:
- ✅ يعمل على HTTPS
- ✅ محمي بـ SSL
- ✅ يعمل بشكل تلقائي عند إعادة تشغيل السيرفر
- ✅ مراقَب بواسطة PM2
- ✅ محمي بـ Nginx reverse proxy
