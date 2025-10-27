/**
 * ═══════════════════════════════════════════════════════════════
 * PDF Helpers - دوال مساعدة لإنشاء PDF
 * ═══════════════════════════════════════════════════════════════
 */

import type { InvoiceConfig } from '@/types/invoice.types';

/**
 * تنسيق التاريخ بالعربية
 */
export function formatDateArabic(date: Date): string {
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * تنسيق التاريخ بالإنجليزية
 */
export function formatDateEnglish(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * تنسيق الأرقام بالفواصل
 */
export function formatNumber(num: number, locale: 'ar' | 'en' = 'ar'): string {
  return num.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * تنسيق المبلغ بالريال
 */
export function formatCurrency(amount: number, locale: 'ar' | 'en' = 'ar'): string {
  const formatted = formatNumber(amount, locale);
  return locale === 'ar' ? `${formatted} ريال` : `SAR ${formatted}`;
}

/**
 * تحويل HEX إلى RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return [0, 0, 0];
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

/**
 * حساب عرض النص بالبكسل (تقريبي)
 */
export function getTextWidth(text: string, fontSize: number): number {
  // تقدير تقريبي: حرف عربي = 0.6 * fontSize
  // حرف إنجليزي = 0.5 * fontSize
  const arabicChars = text.match(/[\u0600-\u06FF]/g)?.length || 0;
  const otherChars = text.length - arabicChars;
  
  return (arabicChars * fontSize * 0.6) + (otherChars * fontSize * 0.5);
}

/**
 * تقسيم النص إلى أسطر متعددة
 */
export function wrapText(
  text: string, 
  maxWidth: number, 
  fontSize: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = getTextWidth(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * تحويل صورة إلى Base64
 */
export async function imageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
}

/**
 * توليد رمز QR (باستخدام API خارجي)
 */
export function generateQRCode(data: string, size: number = 150): string {
  // استخدام Google Charts API لتوليد QR Code
  const encodedData = encodeURIComponent(data);
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedData}`;
}

/**
 * حساب نسبة الضريبة
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

/**
 * حساب المجموع مع الضريبة
 */
export function calculateTotal(
  subtotal: number, 
  tax: number = 0, 
  discount: number = 0
): number {
  return subtotal + tax - discount;
}

/**
 * التحقق من صحة IBAN
 */
export function validateIBAN(iban: string): boolean {
  // إزالة المسافات
  const cleanIban = iban.replace(/\s/g, '');
  
  // IBAN السعودي يبدأ بـ SA ويتكون من 24 حرف
  const saudiIbanRegex = /^SA\d{22}$/;
  
  return saudiIbanRegex.test(cleanIban);
}

/**
 * تنسيق IBAN للعرض
 */
export function formatIBAN(iban: string): string {
  const cleanIban = iban.replace(/\s/g, '');
  return cleanIban.match(/.{1,4}/g)?.join(' ') || iban;
}

/**
 * توليد اسم ملف فريد
 */
export function generateFileName(
  type: 'invoice' | 'receipt',
  invoiceNumber: string
): string {
  const timestamp = Date.now();
  const prefix = type === 'invoice' ? 'INV' : 'REC';
  return `${prefix}_${invoiceNumber}_${timestamp}.pdf`;
}

/**
 * ألوان افتراضية للثيم
 */
export const THEME_COLORS = {
  primary: '#0066CC',
  secondary: '#F5F5F5',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  dark: '#1F2937',
  light: '#F9FAFB'
};

/**
 * أحجام الخطوط القياسية
 */
export const FONT_SIZES = {
  title: 24,
  heading: 18,
  subheading: 14,
  body: 12,
  small: 10,
  tiny: 8
};

/**
 * الهوامش القياسية (mm)
 */
export const MARGINS = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

/**
 * أبعاد الصفحة (mm)
 */
export const PAGE_SIZES = {
  A4: {
    width: 210,
    height: 297
  },
  Letter: {
    width: 216,
    height: 279
  }
};
