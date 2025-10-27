/**
 * ═══════════════════════════════════════════════════════════════
 * Invoice Types - أنواع الفواتير
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * معلومات المكتب
 */
export interface OfficeInfo {
  name: string;              // اسم المكتب
  logo?: string;             // شعار المكتب (base64 أو URL)
  phone: string;             // رقم الهاتف
  email: string;             // البريد الإلكتروني
  address: string;           // العنوان
  website?: string;          // الموقع الإلكتروني
  taxNumber?: string;        // الرقم الضريبي
}

/**
 * معلومات العميل
 */
export interface CustomerInfo {
  name: string;              // اسم العميل
  address?: string;          // العنوان
  phone: string;             // رقم الهاتف
  email?: string;            // البريد الإلكتروني
  taxNumber?: string;        // الرقم الضريبي
}

/**
 * عنصر في الفاتورة
 */
export interface InvoiceItem {
  description: string;       // الوصف
  quantity: number;          // الكمية
  price: number;             // السعر
  total: number;             // الإجمالي
}

/**
 * معلومات البنك
 */
export interface BankInfo {
  bankName: string;          // اسم البنك
  accountNumber: string;     // رقم الحساب
  iban: string;              // IBAN
  swiftCode?: string;        // Swift Code
}

/**
 * بيانات الفاتورة
 */
export interface InvoiceData {
  invoiceNumber: string;     // رقم الفاتورة
  date: Date;                // تاريخ الفاتورة
  dueDate?: Date;            // تاريخ الاستحقاق
  
  office: OfficeInfo;        // معلومات المكتب
  customer: CustomerInfo;    // معلومات العميل
  
  items: InvoiceItem[];      // العناصر
  
  subtotal: number;          // المجموع الفرعي
  tax?: number;              // الضريبة
  discount?: number;         // الخصم
  total: number;             // المجموع الكلي
  
  terms?: string;            // البنود والشروط
  notes?: string;            // ملاحظات
  
  bankInfo?: BankInfo;       // معلومات البنك
}

/**
 * بيانات الإيصال
 */
export interface ReceiptData extends InvoiceData {
  paymentMethod: string;     // طريقة الدفع
  paymentReference?: string; // رقم العملية/الشيك
  paidDate: Date;            // تاريخ الدفع الفعلي
  receivedBy?: string;       // اسم المستلم
}

/**
 * إعدادات الفاتورة
 */
export interface InvoiceConfig {
  showLogo: boolean;         // عرض الشعار
  showTax: boolean;          // عرض الضريبة
  taxRate: number;           // نسبة الضريبة (%)
  showDiscount: boolean;     // عرض الخصم
  showBankInfo: boolean;     // عرض معلومات البنك
  showTerms: boolean;        // عرض البنود والشروط
  showQRCode: boolean;       // عرض رمز QR
  primaryColor: string;      // اللون الأساسي (hex)
  secondaryColor: string;    // اللون الثانوي (hex)
  fontFamily: 'Amiri' | 'Cairo' | 'Tajawal'; // نوع الخط
  language: 'ar' | 'en' | 'both'; // اللغة
  pageSize: 'A4' | 'Letter'; // حجم الصفحة
  orientation: 'portrait' | 'landscape'; // الاتجاه
}

/**
 * إعدادات البريد الإلكتروني
 */
export interface EmailConfig {
  subject: string;           // الموضوع
  body: string;              // المحتوى
  attachmentName?: string;   // اسم المرفق
  cc?: string[];             // نسخة إلى
  bcc?: string[];            // نسخة مخفية
}

/**
 * الإعدادات الافتراضية
 */
export const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
  showLogo: true,
  showTax: true,
  taxRate: 15,
  showDiscount: false,
  showBankInfo: true,
  showTerms: true,
  showQRCode: false,
  primaryColor: '#0066CC',
  secondaryColor: '#F5F5F5',
  fontFamily: 'Cairo',
  language: 'ar',
  pageSize: 'A4',
  orientation: 'portrait'
};

/**
 * نتيجة توليد PDF
 */
export interface PDFResult {
  buffer: Buffer;            // المحتوى
  base64: string;            // Base64 للمعاينة
  fileName: string;          // اسم الملف
  size: number;              // الحجم بالبايت
}
