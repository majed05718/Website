#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Deployment Script
# يستخدم لنشر تحديثات المشروع على السيرفر
# ═══════════════════════════════════════════════════════════════

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to print section header
print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo -e "${BLUE}${1}${NC}"
    echo "═══════════════════════════════════════════════════════════"
}

# Start deployment
print_header "🚀 بدء عملية النشر - Property Management System"

# Check if we're in the right directory
if [ ! -d "api" ] || [ ! -d "Web" ]; then
    print_message "❌ خطأ: يجب تشغيل الـ script من مجلد المشروع الرئيسي" "$RED"
    exit 1
fi

# Check environment files
print_header "🔍 التحقق من ملفات Environment"

if [ ! -f "api/.env" ]; then
    print_message "❌ ملف api/.env مفقود" "$RED"
    print_message "قم بإنشائه من api/.env.example" "$YELLOW"
    exit 1
fi

if [ ! -f "Web/.env.local" ]; then
    print_message "❌ ملف Web/.env.local مفقود" "$RED"
    print_message "قم بإنشائه من Web/.env.example" "$YELLOW"
    exit 1
fi

print_message "✅ ملفات Environment موجودة" "$GREEN"

# Pull latest code
print_header "📥 جلب آخر التحديثات من Git"
git pull origin main || {
    print_message "❌ فشل جلب التحديثات من Git" "$RED"
    exit 1
}
print_message "✅ تم جلب التحديثات بنجاح" "$GREEN"

# Backend deployment
print_header "🔧 نشر Backend"
print_message "تثبيت dependencies..." "$YELLOW"
cd api
npm install --production || {
    print_message "❌ فشل تثبيت Backend dependencies" "$RED"
    exit 1
}

print_message "بناء Backend..." "$YELLOW"
npm run build || {
    print_message "❌ فشل بناء Backend" "$RED"
    exit 1
}
cd ..
print_message "✅ Backend جاهز" "$GREEN"

# Frontend deployment
print_header "🎨 نشر Frontend"
print_message "تثبيت dependencies..." "$YELLOW"
cd Web
npm install --production || {
    print_message "❌ فشل تثبيت Frontend dependencies" "$RED"
    exit 1
}

print_message "بناء Frontend..." "$YELLOW"
npm run build || {
    print_message "❌ فشل بناء Frontend" "$RED"
    exit 1
}
cd ..
print_message "✅ Frontend جاهز" "$GREEN"

# Restart services
print_header "🔄 إعادة تشغيل الخدمات"
pm2 restart all || {
    print_message "⚠️  تحذير: فشل إعادة تشغيل PM2" "$YELLOW"
    print_message "تشغيل الخدمات للمرة الأولى..." "$YELLOW"
    pm2 start ecosystem.config.js
}

# Wait for services to start
print_message "انتظار بدء الخدمات..." "$YELLOW"
sleep 5

# Health check
print_header "🏥 فحص صحة الخدمات"

# Check Backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_message "✅ Backend يعمل بنجاح" "$GREEN"
else
    print_message "❌ Backend لا يستجيب" "$RED"
    print_message "تحقق من الـ logs: pm2 logs backend" "$YELLOW"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_message "✅ Frontend يعمل بنجاح" "$GREEN"
else
    print_message "❌ Frontend لا يستجيب" "$RED"
    print_message "تحقق من الـ logs: pm2 logs frontend" "$YELLOW"
fi

# Show PM2 status
print_header "📊 حالة الخدمات"
pm2 status

# Completion message
print_header "✅ اكتمل النشر بنجاح!"
print_message "🌐 Backend:  http://localhost:3001" "$BLUE"
print_message "🌐 Frontend: http://localhost:3000" "$BLUE"
print_message "" ""
print_message "💡 لعرض الـ logs: pm2 logs" "$YELLOW"
print_message "💡 لعرض الحالة: pm2 status" "$YELLOW"
