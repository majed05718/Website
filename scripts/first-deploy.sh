#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# First Deployment Script
# يستخدم لأول نشر للمشروع على السيرفر
# ═══════════════════════════════════════════════════════════════

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo -e "${BLUE}${1}${NC}"
    echo "═══════════════════════════════════════════════════════════"
}

print_header "🎉 أول نشر للمشروع - Property Management System"

# Check environment files
print_header "🔍 التحقق من ملفات Environment"

if [ ! -f "api/.env" ]; then
    print_message "⚠️  ملف api/.env غير موجود" "$YELLOW"
    print_message "قم بإنشائه من api/.env.example وتعديل القيم" "$YELLOW"
    print_message "" ""
    print_message "مثال:" "$BLUE"
    print_message "  cp api/.env.example api/.env" "$BLUE"
    print_message "  nano api/.env" "$BLUE"
    print_message "" ""
    print_message "ثم شغّل الـ script مرة أخرى" "$YELLOW"
    exit 1
fi

if [ ! -f "Web/.env.local" ]; then
    print_message "⚠️  ملف Web/.env.local غير موجود" "$YELLOW"
    print_message "قم بإنشائه من Web/.env.example وتعديل القيم" "$YELLOW"
    print_message "" ""
    print_message "مثال:" "$BLUE"
    print_message "  cp Web/.env.example Web/.env.local" "$BLUE"
    print_message "  nano Web/.env.local" "$BLUE"
    print_message "" ""
    print_message "ثم شغّل الـ script مرة أخرى" "$YELLOW"
    exit 1
fi

print_message "✅ ملفات Environment موجودة" "$GREEN"

# Install Backend
print_header "📦 تثبيت Backend Dependencies"
cd api
npm install --production || {
    print_message "❌ فشل تثبيت Backend dependencies" "$RED"
    exit 1
}
print_message "✅ Backend dependencies مثبتة" "$GREEN"

print_message "بناء Backend..." "$YELLOW"
npm run build || {
    print_message "❌ فشل بناء Backend" "$RED"
    exit 1
}
print_message "✅ Backend مبني بنجاح" "$GREEN"
cd ..

# Install Frontend
print_header "📦 تثبيت Frontend Dependencies"
cd Web
npm install --production || {
    print_message "❌ فشل تثبيت Frontend dependencies" "$RED"
    exit 1
}
print_message "✅ Frontend dependencies مثبتة" "$GREEN"

print_message "بناء Frontend..." "$YELLOW"
npm run build || {
    print_message "❌ فشل بناء Frontend" "$RED"
    exit 1
}
print_message "✅ Frontend مبني بنجاح" "$GREEN"
cd ..

# Create PM2 ecosystem file
print_header "⚙️  إنشاء PM2 Configuration"
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
    },
    {
      name: 'frontend',
      cwd: './Web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};
EOF

print_message "✅ PM2 config مُنشأ بنجاح" "$GREEN"

# Create logs directory
print_message "إنشاء مجلد logs..." "$YELLOW"
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start with PM2
print_header "🚀 بدء الخدمات مع PM2"
pm2 start ecosystem.config.js || {
    print_message "❌ فشل بدء الخدمات" "$RED"
    exit 1
}

# Save PM2 configuration
print_message "حفظ إعدادات PM2..." "$YELLOW"
pm2 save

# Setup PM2 startup
print_message "إعداد PM2 للتشغيل التلقائي..." "$YELLOW"
pm2 startup || {
    print_message "⚠️  قد تحتاج إلى تشغيل الأمر المعروض أعلاه بصلاحيات sudo" "$YELLOW"
}

# Wait for services to start
sleep 5

# Show status
print_header "📊 حالة الخدمات"
pm2 status

# Completion
print_header "✅ اكتمل أول نشر بنجاح!"
print_message "" ""
print_message "📝 الخطوات التالية:" "$YELLOW"
print_message "  1. قم بإعداد Nginx reverse proxy" "$BLUE"
print_message "  2. شغّل: sudo systemctl reload nginx" "$BLUE"
print_message "  3. افتح المتصفح واختبر الموقع" "$BLUE"
print_message "" ""
print_message "💡 أوامر مفيدة:" "$YELLOW"
print_message "  - عرض logs:    pm2 logs" "$BLUE"
print_message "  - عرض الحالة:   pm2 status" "$BLUE"
print_message "  - إعادة تشغيل: pm2 restart all" "$BLUE"
print_message "  - إيقاف:       pm2 stop all" "$BLUE"
