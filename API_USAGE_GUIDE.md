# 📚 API Usage Guide - دليل استخدام الـ APIs

## 🔐 Authentication

جميع الـ endpoints تتطلب Bearer Token في الـ header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 👥 Customers API

### 1. قائمة العملاء (مع Filters)

```bash
GET /customers?page=1&limit=20&search=محمد&type=buyer&status=active
```

**Query Parameters:**
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج (default: 20, max: 100)
- `search` (optional): البحث في الاسم/البريد/الهاتف
- `type` (optional): buyer | seller | renter | landlord | both
- `status` (optional): active | inactive | blocked
- `city` (optional): المدينة
- `source` (optional): مصدر العميل
- `rating` (optional): 1-5
- `assigned_staff_id` (optional): UUID
- `order_by` (optional): created_at | updated_at | name | last_contact_date
- `order` (optional): asc | desc

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "office_id": "uuid",
      "name": "محمد أحمد",
      "phone": "+966501234567",
      "email": "mohamed@example.com",
      "type": "buyer",
      "status": "active",
      "city": "الرياض",
      "rating": 5,
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### 2. إحصائيات العملاء

```bash
GET /customers/stats
```

**Response:**
```json
{
  "total": 150,
  "active": 120,
  "inactive": 25,
  "blocked": 5,
  "buyers": 80,
  "sellers": 40,
  "renters": 20,
  "landlords": 10,
  "total_spent": 5000000,
  "total_earned": 3000000
}
```

### 3. البحث السريع

```bash
GET /customers/search?q=محمد
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "محمد أحمد",
    "phone": "+966501234567",
    "email": "mohamed@example.com",
    "type": "buyer",
    "status": "active"
  }
]
```

### 4. تفاصيل عميل

```bash
GET /customers/:id
```

### 5. إضافة عميل جديد

```bash
POST /customers
Content-Type: application/json

{
  "name": "محمد أحمد",
  "phone": "+966501234567",
  "email": "mohamed@example.com",
  "type": "buyer",
  "status": "active",
  "city": "الرياض",
  "address": "شارع الملك فهد",
  "preferred_contact_method": "whatsapp",
  "source": "website",
  "rating": 5,
  "notes": "عميل مميز",
  "tags": {
    "interests": ["villa", "apartment"]
  }
}
```

### 6. تعديل عميل

```bash
PATCH /customers/:id
Content-Type: application/json

{
  "status": "inactive",
  "rating": 4,
  "notes": "تم التحديث"
}
```

### 7. حذف عميل

```bash
DELETE /customers/:id
```

### 8. إضافة ملاحظة للعميل

```bash
POST /customers/:id/notes
Content-Type: application/json

{
  "content": "العميل مهتم بالشقق في شمال الرياض",
  "is_important": true,
  "tags": {
    "category": "follow_up"
  }
}
```

### 9. تعديل ملاحظة

```bash
PATCH /customers/:id/notes/:noteId
Content-Type: application/json

{
  "content": "تم التحديث",
  "is_important": false
}
```

### 10. حذف ملاحظة

```bash
DELETE /customers/:id/notes/:noteId
```

### 11. إضافة تعامل للعميل

```bash
POST /customers/:id/interactions
Content-Type: application/json

{
  "type": "call",
  "description": "تم الاتصال لمتابعة طلب العميل",
  "date": "2025-10-20T10:00:00Z",
  "outcome": "العميل مهتم ويريد زيارة العقار",
  "next_follow_up": "2025-10-25T14:00:00Z",
  "property_id": "uuid-optional"
}
```

**Types:** call | meeting | email | whatsapp | visit

### 12. ربط عقار بالعميل

```bash
POST /customers/:id/properties
Content-Type: application/json

{
  "property_id": "uuid",
  "relationship": "interested",
  "start_date": "2025-10-20T10:00:00Z"
}
```

**Relationships:** owner | interested | viewed | negotiating | contracted

### 13. إلغاء ربط عقار

```bash
DELETE /customers/:id/properties/:propertyId
```

### 14. تصدير Excel

```bash
GET /customers/export
```

---

## 📅 Appointments API

### 1. قائمة المواعيد (مع Filters)

```bash
GET /appointments?page=1&limit=20&date=2025-10-20&type=viewing&status=scheduled
```

**Query Parameters:**
- `page` (optional): رقم الصفحة
- `limit` (optional): عدد النتائج
- `search` (optional): البحث في العنوان/الوصف
- `type` (optional): viewing | meeting | signing | inspection | consultation | other
- `status` (optional): scheduled | confirmed | in_progress | completed | cancelled | no_show
- `date` (optional): تاريخ محدد (YYYY-MM-DD)
- `start_date` (optional): من تاريخ
- `end_date` (optional): إلى تاريخ
- `property_id` (optional): UUID
- `customer_id` (optional): UUID
- `assigned_staff_id` (optional): UUID
- `order_by` (optional): date | created_at | start_time
- `order` (optional): asc | desc

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "معاينة عقار",
      "type": "viewing",
      "status": "scheduled",
      "date": "2025-10-20",
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "duration": 60,
      "property_id": "uuid",
      "customer_id": "uuid",
      "assigned_staff_id": "uuid",
      "location": "شارع الملك فهد، الرياض"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### 2. إحصائيات المواعيد

```bash
GET /appointments/stats
```

**Response:**
```json
{
  "total": 100,
  "scheduled": 30,
  "confirmed": 20,
  "in_progress": 5,
  "completed": 40,
  "cancelled": 4,
  "no_show": 1,
  "today": 8,
  "upcoming": 25,
  "viewing": 60,
  "meeting": 30,
  "signing": 10
}
```

### 3. مواعيد التقويم

```bash
GET /appointments/calendar?startDate=2025-10-01&endDate=2025-10-31
```

### 4. مواعيد اليوم

```bash
GET /appointments/today
```

### 5. المواعيد القادمة

```bash
GET /appointments/upcoming?limit=10
```

### 6. تفاصيل موعد

```bash
GET /appointments/:id
```

### 7. إضافة موعد جديد

```bash
POST /appointments
Content-Type: application/json

{
  "title": "معاينة عقار",
  "description": "معاينة شقة في حي النرجس",
  "type": "viewing",
  "date": "2025-10-20",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "duration": 60,
  "property_id": "uuid",
  "customer_id": "uuid",
  "assigned_staff_id": "uuid",
  "location": "شارع الملك فهد، الرياض",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "notes": "يُرجى إحضار الهوية الوطنية"
}
```

**Note:** النظام يتحقق تلقائياً من التعارض في المواعيد

### 8. تعديل موعد

```bash
PATCH /appointments/:id
Content-Type: application/json

{
  "start_time": "14:00:00",
  "end_time": "15:00:00",
  "notes": "تم تغيير الوقت بناءً على طلب العميل"
}
```

### 9. حذف موعد

```bash
DELETE /appointments/:id
```

### 10. تحديث حالة الموعد

```bash
PATCH /appointments/:id/status
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "تم تأكيد الموعد مع العميل"
}
```

**Statuses:** scheduled | confirmed | in_progress | completed | cancelled | no_show

### 11. إلغاء موعد

```bash
PATCH /appointments/:id/cancel
Content-Type: application/json

{
  "cancellation_reason": "العميل طلب إلغاء الموعد"
}
```

### 12. إتمام موعد

```bash
PATCH /appointments/:id/complete
Content-Type: application/json

{
  "completion_notes": "تمت المعاينة بنجاح، العميل مهتم بالعقار"
}
```

### 13. إرسال تذكير

```bash
POST /appointments/:id/remind
```

### 14. التحقق من توفر موعد

```bash
POST /appointments/check-availability
Content-Type: application/json

{
  "date": "2025-10-20",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "assigned_staff_id": "uuid"
}
```

**Response:**
```json
{
  "available": true,
  "conflicts": []
}
```

أو إذا كان هناك تعارض:

```json
{
  "available": false,
  "conflicts": [
    {
      "id": "uuid",
      "title": "موعد آخر",
      "start_time": "10:30:00",
      "end_time": "11:30:00"
    }
  ]
}
```

---

## 📊 Excel System (Properties)

### 1. استيراد Excel

```bash
POST /properties/import
Content-Type: multipart/form-data

file: [Excel file]
```

**Response:**
```json
{
  "valid": [
    {
      "property_code": "P001",
      "title": "شقة في الرياض",
      // ... other fields
    }
  ],
  "invalid": [
    {
      "row": 3,
      "errors": ["property_code مطلوب", "title مطلوب"]
    }
  ]
}
```

### 2. تأكيد الاستيراد

```bash
POST /properties/import/confirm
Content-Type: application/json

{
  "rows": [
    {
      "property_code": "P001",
      "property_type": "apartment",
      "listing_type": "sale",
      "title": "شقة في الرياض",
      "price": 500000,
      "currency": "SAR"
    }
  ]
}
```

**Response:**
```json
{
  "success": 5,
  "errors": []
}
```

### 3. تصدير Excel

```bash
GET /properties/export
```

Returns Excel file

---

## 🔒 Authorization

### Roles:
- **manager**: كامل الصلاحيات
- **staff**: صلاحيات محدودة (لا يمكن الحذف)

### Protected Endpoints:

**Manager Only:**
- `DELETE /customers/:id`
- `DELETE /appointments/:id`

**Manager & Staff:**
- All POST/PATCH operations
- Export operations

**All Authenticated:**
- All GET operations

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "رقم الهاتف مسجل مسبقاً",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "يجب تسجيل الدخول",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "العميل غير موجود",
  "error": "Not Found"
}
```

### 422 Validation Error
```json
{
  "statusCode": 422,
  "message": [
    "name should not be empty",
    "phone must be a string"
  ],
  "error": "Unprocessable Entity"
}
```

---

## 📝 Notes

1. **Date Format:** استخدم ISO 8601 (YYYY-MM-DD أو YYYY-MM-DDTHH:MM:SSZ)
2. **Time Format:** استخدم HH:MM:SS (24-hour format)
3. **UUIDs:** جميع الـ IDs هي UUIDs
4. **Pagination:** القيمة الافتراضية 20 عنصر، الحد الأقصى 100
5. **Search:** غير حساس لحالة الأحرف (case-insensitive)
6. **Conflict Detection:** النظام يمنع التعارض في مواعيد نفس الموظف تلقائياً

---

## 🧪 Testing with Swagger

1. افتح: `http://localhost:3001/api/docs`
2. اضغط على **Authorize**
3. أدخل Bearer Token
4. جرب الـ endpoints

---

## 📞 Support

لأي استفسارات أو مشاكل، راجع:
- Swagger Documentation: `/api/docs`
- Health Check: `/health`
- Backend Completion Report: `BACKEND_COMPLETION_REPORT.md`
