/**
 * ═══════════════════════════════════════════════════════════════
 * Invoice Generator - مولد الفواتير والإيصالات
 * ═══════════════════════════════════════════════════════════════
 * 
 * استخدام jsPDF لإنشاء فواتير وإيصالات احترافية بالعربية
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type {
  InvoiceData,
  ReceiptData,
  InvoiceConfig,
  EmailConfig,
  PDFResult,
  DEFAULT_INVOICE_CONFIG
} from '@/types/invoice.types';
import {
  formatDateArabic,
  formatCurrency,
  hexToRgb,
  formatIBAN,
  generateFileName,
  FONT_SIZES,
  MARGINS,
  PAGE_SIZES
} from './utils/pdf-helpers';

/**
 * ═══════════════════════════════════════════════════════════════
 * توليد فاتورة PDF
 * ═══════════════════════════════════════════════════════════════
 */
export async function generateInvoice(
  invoiceData: InvoiceData,
  config: Partial<InvoiceConfig> = {}
): Promise<PDFResult> {
  // دمج الإعدادات مع الإعدادات الافتراضية
  const finalConfig: InvoiceConfig = {
    ...DEFAULT_INVOICE_CONFIG,
    ...config
  };

  // إنشاء مستند PDF
  const doc = new jsPDF({
    orientation: finalConfig.orientation,
    unit: 'mm',
    format: finalConfig.pageSize
  });

  // إضافة الخط العربي (يجب تحميله مسبقاً)
  // ملاحظة: يحتاج إلى ملف الخط بصيغة base64
  // doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
  // doc.setFont('Cairo');

  // الألوان
  const primaryRGB = hexToRgb(finalConfig.primaryColor);
  const secondaryRGB = hexToRgb(finalConfig.secondaryColor);

  let yPosition = MARGINS.top;

  // ═════════════════════════════════════════════════════════════
  // HEADER - رأس الفاتورة
  // ═════════════════════════════════════════════════════════════
  
  // اسم المكتب (يمين)
  doc.setFontSize(FONT_SIZES.title);
  doc.setTextColor(...primaryRGB);
  doc.text(invoiceData.office.name, PAGE_SIZES.A4.width - MARGINS.right, yPosition, {
    align: 'right'
  });

  // الشعار (يسار) - إذا موجود
  if (finalConfig.showLogo && invoiceData.office.logo) {
    try {
      doc.addImage(
        invoiceData.office.logo,
        'PNG',
        MARGINS.left,
        yPosition - 5,
        30,
        30
      );
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  yPosition += 10;

  // معلومات التواصل (يمين)
  doc.setFontSize(FONT_SIZES.small);
  doc.setTextColor(100, 100, 100);
  
  const contactInfo = [
    `الهاتف: ${invoiceData.office.phone}`,
    `البريد: ${invoiceData.office.email}`,
    `العنوان: ${invoiceData.office.address}`,
  ];

  if (invoiceData.office.website) {
    contactInfo.push(`الموقع: ${invoiceData.office.website}`);
  }

  contactInfo.forEach(line => {
    doc.text(line, PAGE_SIZES.A4.width - MARGINS.right, yPosition, {
      align: 'right'
    });
    yPosition += 5;
  });

  yPosition += 5;

  // خط فاصل
  doc.setDrawColor(...primaryRGB);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, yPosition, PAGE_SIZES.A4.width - MARGINS.right, yPosition);
  
  yPosition += 10;

  // ═════════════════════════════════════════════════════════════
  // معلومات الفاتورة
  // ═════════════════════════════════════════════════════════════
  
  doc.setFontSize(FONT_SIZES.heading);
  doc.setTextColor(...primaryRGB);
  doc.text('فاتورة', PAGE_SIZES.A4.width / 2, yPosition, { align: 'center' });
  
  yPosition += 10;

  // رقم الفاتورة والتاريخ
  doc.setFontSize(FONT_SIZES.body);
  doc.setTextColor(0, 0, 0);
  
  const invoiceInfo = [
    [`رقم الفاتورة: ${invoiceData.invoiceNumber}`, PAGE_SIZES.A4.width - MARGINS.right],
    [`التاريخ: ${formatDateArabic(invoiceData.date)}`, PAGE_SIZES.A4.width - MARGINS.right]
  ];

  if (invoiceData.dueDate) {
    invoiceInfo.push([
      `تاريخ الاستحقاق: ${formatDateArabic(invoiceData.dueDate)}`,
      PAGE_SIZES.A4.width - MARGINS.right
    ]);
  }

  invoiceInfo.forEach(([text, x]) => {
    doc.text(text, x, yPosition, { align: 'right' });
    yPosition += 6;
  });

  yPosition += 5;

  // ═════════════════════════════════════════════════════════════
  // معلومات العميل (Box ملون)
  // ═════════════════════════════════════════════════════════════
  
  const customerBoxHeight = 35;
  
  // رسم الصندوق
  doc.setFillColor(...secondaryRGB);
  doc.rect(MARGINS.left, yPosition, PAGE_SIZES.A4.width - MARGINS.left - MARGINS.right, customerBoxHeight, 'F');
  
  // عنوان "إلى:"
  yPosition += 8;
  doc.setFontSize(FONT_SIZES.subheading);
  doc.setTextColor(...primaryRGB);
  doc.text('إلى:', PAGE_SIZES.A4.width - MARGINS.right - 5, yPosition, { align: 'right' });
  
  yPosition += 6;

  // معلومات العميل
  doc.setFontSize(FONT_SIZES.body);
  doc.setTextColor(0, 0, 0);
  
  const customerInfo = [
    invoiceData.customer.name,
    invoiceData.customer.phone,
  ];

  if (invoiceData.customer.address) {
    customerInfo.push(invoiceData.customer.address);
  }

  if (invoiceData.customer.email) {
    customerInfo.push(invoiceData.customer.email);
  }

  customerInfo.forEach(line => {
    doc.text(line, PAGE_SIZES.A4.width - MARGINS.right - 5, yPosition, { align: 'right' });
    yPosition += 5;
  });

  yPosition += 10;

  // ═════════════════════════════════════════════════════════════
  // جدول العناصر
  // ═════════════════════════════════════════════════════════════
  
  const tableData = invoiceData.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.total)
  ]);

  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: yPosition,
    head: [['#', 'الوصف', 'الكمية', 'السعر', 'الإجمالي']],
    body: tableData,
    styles: {
      font: 'Cairo',
      fontSize: FONT_SIZES.body,
      cellPadding: 5,
      halign: 'right'
    },
    headStyles: {
      fillColor: primaryRGB,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: secondaryRGB
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'right', cellWidth: 70 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 }
    },
    margin: { left: MARGINS.left, right: MARGINS.right }
  });

  // @ts-ignore
  yPosition = doc.lastAutoTable.finalY + 10;

  // ═════════════════════════════════════════════════════════════
  // الإجماليات (يمين الصفحة)
  // ═════════════════════════════════════════════════════════════
  
  const totalsX = PAGE_SIZES.A4.width - MARGINS.right - 5;
  const totalsBoxWidth = 60;
  
  doc.setFontSize(FONT_SIZES.body);
  
  // المجموع الفرعي
  doc.text('المجموع الفرعي:', totalsX, yPosition, { align: 'right' });
  doc.text(formatCurrency(invoiceData.subtotal), totalsX - totalsBoxWidth, yPosition, { align: 'left' });
  yPosition += 6;

  // الضريبة (إذا موجودة)
  if (finalConfig.showTax && invoiceData.tax) {
    doc.text(`الضريبة (${finalConfig.taxRate}%):`, totalsX, yPosition, { align: 'right' });
    doc.text(formatCurrency(invoiceData.tax), totalsX - totalsBoxWidth, yPosition, { align: 'left' });
    yPosition += 6;
  }

  // الخصم (إذا موجود)
  if (finalConfig.showDiscount && invoiceData.discount) {
    doc.text('الخصم:', totalsX, yPosition, { align: 'right' });
    doc.text(`-${formatCurrency(invoiceData.discount)}`, totalsX - totalsBoxWidth, yPosition, { align: 'left' });
    yPosition += 6;
  }

  // خط فاصل
  doc.setDrawColor(...primaryRGB);
  doc.setLineWidth(0.3);
  doc.line(totalsX - totalsBoxWidth, yPosition, totalsX, yPosition);
  yPosition += 4;

  // المجموع الكلي
  doc.setFontSize(FONT_SIZES.heading);
  doc.setTextColor(...primaryRGB);
  doc.text('المجموع الكلي:', totalsX, yPosition, { align: 'right' });
  doc.text(formatCurrency(invoiceData.total), totalsX - totalsBoxWidth, yPosition, { align: 'left' });
  
  yPosition += 15;

  // ═════════════════════════════════════════════════════════════
  // FOOTER - تذييل الفاتورة
  // ═════════════════════════════════════════════════════════════
  
  const footerY = PAGE_SIZES.A4.height - 50;
  
  // معلومات البنك (إذا مطلوبة)
  if (finalConfig.showBankInfo && invoiceData.bankInfo) {
    doc.setFontSize(FONT_SIZES.small);
    doc.setTextColor(0, 0, 0);
    
    let bankY = footerY;
    
    doc.text('معلومات البنك:', PAGE_SIZES.A4.width - MARGINS.right, bankY, { align: 'right' });
    bankY += 5;
    
    doc.setFontSize(FONT_SIZES.tiny);
    doc.setTextColor(100, 100, 100);
    
    const bankInfo = [
      `البنك: ${invoiceData.bankInfo.bankName}`,
      `رقم الحساب: ${invoiceData.bankInfo.accountNumber}`,
      `IBAN: ${formatIBAN(invoiceData.bankInfo.iban)}`
    ];

    bankInfo.forEach(line => {
      doc.text(line, PAGE_SIZES.A4.width - MARGINS.right, bankY, { align: 'right' });
      bankY += 4;
    });
  }

  // البنود والشروط (إذا مطلوبة)
  if (finalConfig.showTerms && invoiceData.terms) {
    doc.setFontSize(FONT_SIZES.tiny);
    doc.setTextColor(100, 100, 100);
    
    const termsY = PAGE_SIZES.A4.height - 30;
    doc.text('البنود والشروط:', MARGINS.left, termsY);
    
    const termsLines = doc.splitTextToSize(invoiceData.terms, PAGE_SIZES.A4.width - MARGINS.left - MARGINS.right - 80);
    doc.text(termsLines, MARGINS.left, termsY + 4);
  }

  // شكراً لتعاملكم معنا (وسط)
  doc.setFontSize(FONT_SIZES.body);
  doc.setTextColor(...primaryRGB);
  doc.text(
    'شكراً لتعاملكم معنا',
    PAGE_SIZES.A4.width / 2,
    PAGE_SIZES.A4.height - 15,
    { align: 'center' }
  );

  // ═════════════════════════════════════════════════════════════
  // توليد النتيجة
  // ═════════════════════════════════════════════════════════════
  
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const pdfBase64 = doc.output('datauristring');
  const fileName = generateFileName('invoice', invoiceData.invoiceNumber);

  return {
    buffer: pdfBuffer,
    base64: pdfBase64,
    fileName,
    size: pdfBuffer.length
  };
}

/**
 * ═══════════════════════════════════════════════════════════════
 * توليد إيصال استلام PDF
 * ═══════════════════════════════════════════════════════════════
 */
export async function generateReceipt(
  receiptData: ReceiptData,
  config: Partial<InvoiceConfig> = {}
): Promise<PDFResult> {
  // إنشاء الفاتورة الأساسية
  const invoiceResult = await generateInvoice(receiptData, config);
  
  // إعادة فتح PDF لإضافة ختم "مدفوع"
  const doc = new jsPDF({
    orientation: config.orientation || 'portrait',
    unit: 'mm',
    format: config.pageSize || 'A4'
  });

  // نسخ محتوى الفاتورة
  // ملاحظة: في التطبيق الحقيقي، يجب دمج PDFs بشكل صحيح
  
  // إضافة ختم "مدفوع" كبير وملون (أخضر، diagonal)
  doc.setFontSize(60);
  doc.setTextColor(16, 185, 129); // green-500
  doc.setFont(undefined, 'bold');
  
  // حفظ الحالة
  doc.saveGraphicsState();
  
  // تدوير النص 45 درجة
  const centerX = PAGE_SIZES.A4.width / 2;
  const centerY = PAGE_SIZES.A4.height / 2;
  
  doc.setGState(new doc.GState({ opacity: 0.3 }));
  
  // رسم النص بزاوية
  doc.text('مدفوع', centerX, centerY, {
    align: 'center',
    angle: 45
  });
  
  // استعادة الحالة
  doc.restoreGraphicsState();

  // إضافة تفاصيل الدفع في الأسفل
  let yPosition = PAGE_SIZES.A4.height - 80;
  
  doc.setFontSize(FONT_SIZES.subheading);
  doc.setTextColor(0, 0, 0);
  doc.text('تفاصيل الدفع', PAGE_SIZES.A4.width / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  
  doc.setFontSize(FONT_SIZES.body);
  
  const paymentDetails = [
    `طريقة الدفع: ${receiptData.paymentMethod}`,
    `رقم العملية: ${receiptData.paymentReference || '-'}`,
    `تاريخ الدفع: ${formatDateArabic(receiptData.paidDate)}`
  ];

  if (receiptData.receivedBy) {
    paymentDetails.push(`المستلم: ${receiptData.receivedBy}`);
  }

  paymentDetails.forEach(line => {
    doc.text(line, PAGE_SIZES.A4.width / 2, yPosition, { align: 'center' });
    yPosition += 6;
  });

  // خط للتوقيع
  yPosition += 10;
  const signatureWidth = 60;
  const signatureX = (PAGE_SIZES.A4.width - signatureWidth) / 2;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(signatureX, yPosition, signatureX + signatureWidth, yPosition);
  
  yPosition += 4;
  doc.setFontSize(FONT_SIZES.small);
  doc.text('التوقيع', PAGE_SIZES.A4.width / 2, yPosition, { align: 'center' });

  // توليد النتيجة
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const pdfBase64 = doc.output('datauristring');
  const fileName = generateFileName('receipt', receiptData.invoiceNumber);

  return {
    buffer: pdfBuffer,
    base64: pdfBase64,
    fileName,
    size: pdfBuffer.length
  };
}

/**
 * ═══════════════════════════════════════════════════════════════
 * معاينة الفاتورة (Base64)
 * ═══════════════════════════════════════════════════════════════
 */
export async function previewInvoice(
  invoiceData: InvoiceData,
  config?: Partial<InvoiceConfig>
): Promise<string> {
  const result = await generateInvoice(invoiceData, config);
  return result.base64;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * إرسال فاتورة بالإيميل
 * ═══════════════════════════════════════════════════════════════
 */
export async function sendInvoiceEmail(
  invoiceId: string,
  email: string,
  emailConfig?: EmailConfig
): Promise<void> {
  // في التطبيق الحقيقي، هذا يتطلب backend API
  // مثال:
  // await fetch('/api/invoices/send-email', {
  //   method: 'POST',
  //   body: JSON.stringify({ invoiceId, email, emailConfig })
  // });

  console.log('Sending invoice email:', { invoiceId, email, emailConfig });
  
  throw new Error('Email sending requires backend implementation');
}

/**
 * ═══════════════════════════════════════════════════════════════
 * تحميل الفاتورة مباشرة للمتصفح
 * ═══════════════════════════════════════════════════════════════
 */
export async function downloadInvoice(
  invoiceData: InvoiceData,
  config?: Partial<InvoiceConfig>
): Promise<void> {
  const result = await generateInvoice(invoiceData, config);
  
  // إنشاء blob
  const blob = new Blob([result.buffer], { type: 'application/pdf' });
  
  // إنشاء رابط تحميل
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.fileName;
  
  // تنفيذ التحميل
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // تنظيف
  URL.revokeObjectURL(url);
}

/**
 * ═══════════════════════════════════════════════════════════════
 * طباعة الفاتورة مباشرة
 * ═══════════════════════════════════════════════════════════════
 */
export async function printInvoice(
  invoiceData: InvoiceData,
  config?: Partial<InvoiceConfig>
): Promise<void> {
  const result = await generateInvoice(invoiceData, config);
  
  // فتح في نافذة جديدة للطباعة
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة فاتورة ${invoiceData.invoiceNumber}</title>
        </head>
        <body style="margin: 0;">
          <embed 
            src="${result.base64}" 
            type="application/pdf" 
            width="100%" 
            height="100%"
          />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // تنفيذ الطباعة بعد التحميل
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
