#!/bin/bash
echo "════════════════════════════════════════════════════"
echo "🐛 فحص المشاكل المعروفة"
echo "════════════════════════════════════════════════════"

echo -e "\n🔴 1. DTO Naming - Backend Customers:"
grep -n "preferred" ~/workspace/api/src/customers/dto/create-customer.dto.ts 2>/dev/null | head -3

echo -e "\n🔴 1. DTO Naming - Frontend Customers:"
grep -n "preferred" ~/workspace/Web/src/types/customer.ts 2>/dev/null | head -3

echo -e "\n🔴 2. DTO Naming - Backend Appointments:"
grep -n "startTime\|start_time\|endTime\|end_time" ~/workspace/api/src/appointments/dto/create-appointment.dto.ts 2>/dev/null | head -5

echo -e "\n🔴 2. DTO Naming - Frontend Appointments:"
grep -n "startTime\|start_time\|endTime\|end_time" ~/workspace/Web/src/types/appointment.ts 2>/dev/null | head -5

echo -e "\n📦 3. مكتبات Excel:"
cd ~/workspace/Web
grep "xlsx\|papaparse" package.json 2>/dev/null || echo "  ⚠️  مكتبات Excel قد تكون مفقودة"

echo -e "\n⚙️  4. Backend Build Test:"
cd ~/workspace/api
echo "  جاري البناء..."
npm run build > /tmp/backend_build.log 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ نجح"
else
    echo "  ❌ فشل! عرض آخر 20 سطر:"
    tail -20 /tmp/backend_build.log
fi

echo -e "\n⚙️  5. TypeScript Check:"
cd ~/workspace/Web
npx tsc --noEmit > /tmp/ts_check.log 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ لا أخطاء"
else
    echo "  ⚠️  الأخطاء:"
    head -20 /tmp/ts_check.log
fi

echo -e "\n════════════════════════════════════════════════════"
