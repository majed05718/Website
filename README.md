# 🏢 نظام إدارة العقارات

نظام متكامل لإدارة العقارات والمكاتب العقارية

## 🚀 البدء السريع

### على Replit:
1. اضغط زر "Run"
2. انتظر حتى يتم تثبيت التبعيات
3. افتح المشروع على المنفذ 5000

### محلياً:
```bash
# تثبيت التبعيات
npm run install:all

# تشغيل وضع التطوير
npm run dev:all

# تشغيل وضع الإنتاج
npm run start:all
```

## 📁 هيكل المشروع

```
real-estate-system/
├── api/                    # Backend (NestJS)
│   ├── src/
│   │   ├── auth/          # نظام المصادقة
│   │   ├── properties/    # إدارة العقارات
│   │   ├── payments/      # إدارة المدفوعات
│   │   └── ...
│   └── package.json
├── Web/                   # Frontend (Next.js)
│   ├── src/
│   │   ├── app/          # صفحات التطبيق
│   │   ├── components/   # مكونات UI
│   │   ├── lib/          # مكتبات مساعدة
│   │   └── store/        # إدارة الحالة
│   └── package.json
├── .replit               # إعدادات Replit
├── package.json          # إعدادات المشروع الرئيسي
└── README.md
```

## 🛠️ التقنيات المستخدمة

### Backend:
- **NestJS** - إطار عمل Node.js
- **TypeORM** - ORM لقاعدة البيانات
- **PostgreSQL** - قاعدة البيانات
- **JWT** - المصادقة
- **Swagger** - توثيق API

### Frontend:
- **Next.js 14** - إطار عمل React
- **TypeScript** - لغة البرمجة
- **Tailwind CSS** - تصميم CSS
- **Zustand** - إدارة الحالة
- **React Hook Form** - إدارة النماذج
- **Recharts** - الرسوم البيانية

## 🔧 الأوامر المتاحة

### تثبيت التبعيات:
```bash
npm run install:all
```

### وضع التطوير:
```bash
npm run dev:all          # تشغيل Backend + Frontend
npm run dev:api          # تشغيل Backend فقط
npm run dev:web          # تشغيل Frontend فقط
```

### وضع الإنتاج:
```bash
npm run start:all        # تشغيل Backend + Frontend
npm run start:api        # تشغيل Backend فقط
npm run start:web        # تشغيل Frontend فقط
```

## 🌐 المنافذ (Ports)

- **Backend API**: `3001`
- **Frontend Web**: `5000`
- **Replit External**: `3000` (Frontend)

## 🔐 متغيرات البيئة

انسخ ملف `.env.example` إلى `.env` واملأ القيم المطلوبة:

```bash
cp .env.example .env
```

### متغيرات Backend:
- `DATABASE_URL` - رابط قاعدة البيانات
- `JWT_SECRET` - مفتاح JWT
- `PORT` - منفذ الخادم

### متغيرات Frontend:
- `NEXT_PUBLIC_API_URL` - رابط API

## 📱 المميزات

### 🔐 نظام المصادقة:
- تسجيل دخول آمن
- حماية الصفحات
- إدارة الجلسات

### 🏢 إدارة العقارات:
- عرض العقارات
- إضافة وتعديل العقارات
- البحث والفلترة
- إدارة الصور

### 📊 لوحة التحكم:
- إحصائيات شاملة
- رسوم بيانية تفاعلية
- تقارير مفصلة

### 📱 تصميم متجاوب:
- يعمل على جميع الأجهزة
- دعم اللغة العربية (RTL)
- واجهة مستخدم حديثة

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يرجى فتح issue في GitHub.

---

**تم تطويره بـ ❤️ لخدمة قطاع العقارات**