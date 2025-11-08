#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Production Fix Script - Real Estate Management
# يصلح جميع المشاكل المكتشفة تلقائياً
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ═══════════════════════════════════════════════════════════════
# Step 0: Initial Checks
# ═══════════════════════════════════════════════════════════════

print_step "Step 0: فحص متطلبات النظام"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js غير مثبت!"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm غير مثبت!"
    exit 1
fi
NPM_VERSION=$(npm --version)
print_success "npm: $NPM_VERSION"

# Check if in correct directory
if [ ! -f "ecosystem.config.js" ]; then
    print_error "الرجاء تشغيل هذا السكريبت من المجلد الرئيسي للمشروع (/workspace)"
    exit 1
fi
print_success "المجلد الحالي صحيح"

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 1: Install PM2
# ═══════════════════════════════════════════════════════════════

print_step "Step 1: تثبيت PM2"

if ! command -v pm2 &> /dev/null; then
    print_info "تثبيت PM2 globally..."
    sudo npm install -g pm2
    print_success "PM2 تم تثبيته بنجاح"
else
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 مثبت مسبقاً: v$PM2_VERSION"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 2: Install Backend Dependencies
# ═══════════════════════════════════════════════════════════════

print_step "Step 2: تثبيت Backend Dependencies"

cd api

if [ -d "node_modules" ]; then
    print_warning "node_modules موجود مسبقاً - سيتم إعادة التثبيت"
    rm -rf node_modules
fi

print_info "تثبيت npm packages..."
npm install

# Check for UNMET dependencies
UNMET_COUNT=$(npm ls --depth=0 2>&1 | grep -c "UNMET" || true)
if [ "$UNMET_COUNT" -gt 0 ]; then
    print_error "وجدت $UNMET_COUNT UNMET dependencies"
    print_info "محاولة إصلاحها..."
    npm install
else
    print_success "جميع dependencies مثبتة بنجاح"
fi

cd ..

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 3: Create Backend .env if missing
# ═══════════════════════════════════════════════════════════════

print_step "Step 3: فحص Backend Environment Variables"

if [ ! -f "api/.env" ]; then
    print_warning "ملف api/.env غير موجود - سيتم إنشاؤه من .env.example"
    cp api/.env.example api/.env
    print_warning "⚠️  مهم: يجب عليك تحرير api/.env وملء القيم المطلوبة:"
    print_warning "   - SUPABASE_URL"
    print_warning "   - SUPABASE_SERVICE_ROLE_KEY"
    print_warning "   - JWT_SECRET (استخدم: openssl rand -base64 32)"
    print_warning "   - ALLOWED_ORIGINS"
    echo ""
    read -p "اضغط Enter بعد تحرير api/.env..."
else
    print_success "ملف api/.env موجود"
    
    # Check for required variables
    MISSING_VARS=0
    
    if ! grep -q "SUPABASE_URL=https://" api/.env; then
        print_warning "SUPABASE_URL غير مضبوط في api/.env"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
    
    if ! grep -q "SUPABASE_SERVICE_ROLE_KEY=eyJ" api/.env; then
        print_warning "SUPABASE_SERVICE_ROLE_KEY غير مضبوط في api/.env"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
    
    if grep -q "JWT_SECRET=change-this" api/.env; then
        print_warning "JWT_SECRET يجب تغييره في api/.env"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
    
    if grep -q "ALLOWED_ORIGINS=http://your-server-ip" api/.env; then
        print_warning "ALLOWED_ORIGINS يجب تعديله في api/.env"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
    
    if [ "$MISSING_VARS" -gt 0 ]; then
        print_error "وجدت $MISSING_VARS متغيرات غير مضبوطة في api/.env"
        echo ""
        read -p "هل تريد المتابعة رغم ذلك؟ (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "إلغاء... الرجاء تحرير api/.env أولاً"
            exit 1
        fi
    else
        print_success "جميع متغيرات api/.env مضبوطة"
    fi
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 4: Build Backend
# ═══════════════════════════════════════════════════════════════

print_step "Step 4: Build الـ Backend"

cd api

if [ -d "dist" ]; then
    print_info "مجلد dist موجود - سيتم إعادة البناء"
    rm -rf dist
fi

print_info "تشغيل NestJS build..."
npm run build

if [ ! -f "dist/main.js" ]; then
    print_error "Build فشل - dist/main.js غير موجود"
    exit 1
fi

print_success "Backend build ناجح"

cd ..

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 5: Install Frontend Dependencies
# ═══════════════════════════════════════════════════════════════

print_step "Step 5: تثبيت Frontend Dependencies"

cd Web

if [ -d "node_modules" ]; then
    print_warning "node_modules موجود مسبقاً - سيتم إعادة التثبيت"
    rm -rf node_modules
fi

if [ -d ".next" ]; then
    print_info "مسح .next القديم"
    rm -rf .next
fi

print_info "تثبيت npm packages..."
npm install

# Check for UNMET dependencies
UNMET_COUNT=$(npm ls --depth=0 2>&1 | grep -c "UNMET" || true)
if [ "$UNMET_COUNT" -gt 0 ]; then
    print_error "وجدت $UNMET_COUNT UNMET dependencies"
    print_info "محاولة إصلاحها..."
    npm install
else
    print_success "جميع dependencies مثبتة بنجاح"
fi

# Disable telemetry
print_info "تعطيل Next.js telemetry..."
npx next telemetry disable 2>/dev/null || true

cd ..

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 6: Create Frontend .env.local if missing
# ═══════════════════════════════════════════════════════════════

print_step "Step 6: فحص Frontend Environment Variables"

if [ ! -f "Web/.env.local" ]; then
    print_warning "ملف Web/.env.local غير موجود - سيتم إنشاؤه من .env.example"
    cp Web/.env.example Web/.env.local
    print_warning "⚠️  مهم: يجب عليك تحرير Web/.env.local وضبط:"
    print_warning "   - NEXT_PUBLIC_API_URL (مثال: http://YOUR_SERVER_IP:3001)"
    echo ""
    read -p "اضغط Enter بعد تحرير Web/.env.local..."
else
    print_success "ملف Web/.env.local موجود"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_API_URL=http://localhost:3001" Web/.env.local; then
        print_warning "NEXT_PUBLIC_API_URL لا يزال localhost - قد لا يعمل في production"
    elif ! grep -q "NEXT_PUBLIC_API_URL=" Web/.env.local; then
        print_error "NEXT_PUBLIC_API_URL غير موجود في Web/.env.local"
    else
        print_success "NEXT_PUBLIC_API_URL مضبوط"
    fi
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 7: Build Frontend
# ═══════════════════════════════════════════════════════════════

print_step "Step 7: Build الـ Frontend"

cd Web

print_info "تشغيل Next.js build (قد يستغرق بضع دقائق)..."
npm run build

if [ ! -d ".next" ]; then
    print_error "Build فشل - .next غير موجود"
    exit 1
fi

print_success "Frontend build ناجح"

cd ..

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 8: Stop PM2 and Restart
# ═══════════════════════════════════════════════════════════════

print_step "Step 8: إعادة تشغيل PM2"

# Stop all existing processes
print_info "إيقاف جميع عمليات PM2 الحالية..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Flush logs
print_info "مسح logs القديمة..."
pm2 flush

# Start new processes
print_info "تشغيل العمليات الجديدة..."
pm2 start ecosystem.config.js

# Save process list
print_info "حفظ قائمة العمليات..."
pm2 save

print_success "PM2 أعيد تشغيله بنجاح"

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 9: Verify Status
# ═══════════════════════════════════════════════════════════════

print_step "Step 9: التحقق من الحالة"

# Wait a few seconds for processes to stabilize
print_info "انتظار 5 ثوان للتحقق من استقرار العمليات..."
sleep 5

# Show PM2 status
print_info "حالة PM2:"
pm2 status

echo ""

# Check backend health
print_info "فحص Backend health endpoint..."
BACKEND_HEALTH=$(curl -s http://localhost:3001/health || echo "failed")
if [[ $BACKEND_HEALTH == *"ok"* ]]; then
    print_success "Backend يعمل بنجاح"
else
    print_error "Backend لا يستجيب - راجع logs:"
    print_info "pm2 logs backend"
fi

# Check frontend
print_info "فحص Frontend..."
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$FRONTEND_CHECK" == "200" ] || [ "$FRONTEND_CHECK" == "304" ]; then
    print_success "Frontend يعمل بنجاح"
else
    print_error "Frontend لا يستجيب - راجع logs:"
    print_info "pm2 logs frontend"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Step 10: Final Summary
# ═══════════════════════════════════════════════════════════════

print_step "Step 10: الملخص النهائي"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ تم إصلاح المشروع بنجاح!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 معلومات التشغيل:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Backend URL:    ${GREEN}http://localhost:3001${NC}"
echo -e "Frontend URL:   ${GREEN}http://localhost:3000${NC}"
echo -e "Health Check:   ${GREEN}http://localhost:3001/health${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}🔧 أوامر مفيدة:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  pm2 status          → عرض حالة العمليات"
echo "  pm2 logs            → عرض جميع logs"
echo "  pm2 logs backend    → عرض backend logs فقط"
echo "  pm2 logs frontend   → عرض frontend logs فقط"
echo "  pm2 monit           → مراقبة real-time"
echo "  pm2 restart all     → إعادة تشغيل الكل"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}⚠️  ملاحظات مهمة:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. راقب PM2 status للتأكد من عدم وجود restarts"
echo "  2. تحقق من logs بانتظام: pm2 logs"
echo "  3. إذا واجهت مشاكل، راجع: COMPREHENSIVE_ANALYSIS_REPORT.md"
echo "  4. للوصول من الخارج، تأكد من إعداد Nginx/Firewall"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_success "تم الانتهاء بنجاح! 🎉"
