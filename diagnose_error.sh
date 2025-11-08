#!/bin/bash
echo "════════════════════════════════════════════════════"
echo "🔍 التشخيص الشامل"
echo "════════════════════════════════════════════════════"

echo -e "\n📱 1. بيانات Login الحالية:"
cat ~/workspace/Web/src/app/login/page.tsx | grep -A 8 "login({" | head -10

echo -e "\n🔌 2. API URL:"
grep "NEXT_PUBLIC_API_URL" ~/workspace/Web/.env.local 2>/dev/null || echo "   ⚠️  غير محدد"

echo -e "\n🧪 3. اختبار Backend مباشرة:"
curl -s -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"تجربة","phone":"0500000000","type":"buyer","preferredContactMethod":"phone"}' \
  2>&1 | head -15 || echo "   ❌ Backend لا يستجيب"

echo -e "\n📋 4. Frontend Types:"
grep "preferredContact" ~/workspace/Web/src/types/customer.ts 2>/dev/null | head -2

echo -e "\n📋 5. Backend DTO:"
grep "preferredContact" ~/workspace/api/src/customers/dto/create-customer.dto.ts 2>/dev/null | head -2

echo -e "\n🗄️  6. Supabase Config:"
if [ -f ~/workspace/api/.env ]; then
    grep "SUPABASE" ~/workspace/api/.env | sed 's/=.*/=***/' | head -2
else
    echo "   ❌ .env مفقود"
fi

echo -e "\n🌐 7. اختبار من المتصفح:"
echo "   انسخ هذا في Console (F12):"
echo ""
echo "fetch('http://localhost:3001/customers', {"
echo "  method: 'POST',"
echo "  headers: {'Content-Type': 'application/json'},"
echo "  body: JSON.stringify({name:'test',phone:'0500000000',type:'buyer',preferredContactMethod:'phone'})"
echo "}).then(r=>r.json()).then(console.log).catch(console.error)"
echo ""

echo -e "\n════════════════════════════════════════════════════"
