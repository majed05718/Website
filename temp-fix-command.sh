#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# حل سريع لمشكلة tsconfig-paths المفقود
# ═══════════════════════════════════════════════════════════════

echo "🔧 حل مشكلة tsconfig-paths"
echo "════════════════════════════════════════════════════════════"
echo ""

# الحل 1: تثبيت tsconfig-paths
echo "📦 الطريقة 1: تثبيت tsconfig-paths..."
npm install tsconfig-paths --save-dev

if [ -d "node_modules/tsconfig-paths" ]; then
    echo "✅ تم تثبيت tsconfig-paths بنجاح!"
    echo ""
    echo "الآن شغّل:"
    echo "npm run seed:superadmin -- \\"
    echo "  --email=\"az22722101239oz@gmail.com\" \\"
    echo "  --password=\"Az143134\" \\"
    echo "  --name=\"azoz\" \\"
    echo "  --phone=\"+966557431343\""
else
    echo "❌ فشل تثبيت tsconfig-paths"
    echo ""
    echo "🔄 استخدام الطريقة البديلة..."
    echo ""
    
    # الحل البديل: تشغيل بدون tsconfig-paths
    echo "📝 تشغيل السكريبت مباشرة..."
    npx ts-node src/database/seeds/1-create-superadmin.ts \
      --email="az22722101239oz@gmail.com" \
      --password="Az143134" \
      --name="azoz" \
      --phone="+966557431343"
fi
