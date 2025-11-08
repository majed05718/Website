/**
 * ═══════════════════════════════════════════════════════════════
 * Excel Service - خدمة معالجة Excel للعملاء
 * ═══════════════════════════════════════════════════════════════
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { Customer } from './entities/customer.entity';
import {
  ColumnMapping,
  ImportOptions,
  ImportResult,
  RowError,
  CustomerPreview,
  CustomerData,
  CustomerFilters,
  ExportOptions,
  CustomerStatistics,
  TemplateInfo,
  ValidationResult,
  BatchInfo
} from './interfaces/excel.interfaces';

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private dataSource: DataSource,
  ) { }

  /**
   * ═══════════════════════════════════════════════════════════════
   * استيراد العملاء من Excel
   * ═══════════════════════════════════════════════════════════════
   */
  async importCustomersFromExcel(
    file: Express.Multer.File,
    mapping: ColumnMapping[],
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    const startTime = Date.now();
    this.logger.log('بدء استيراد العملاء من Excel');

    try {
      // 1. Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

      this.logger.log(`تم قراءة ${rawData.length} صف من Excel`);

      // 2. Apply column mapping وتحويل البيانات
      const mappedData = this.applyColumnMapping(rawData, mapping);

      // 3. Validate كل صف
      const validationResults = await this.validateAllRows(mappedData);

      // 4. إذا كان validateOnly، نرجع المعاينة فقط
      if (options.validateOnly) {
        return this.generatePreviewResult(
          mappedData,
          validationResults,
          Date.now() - startTime
        );
      }

      // 5. معالجة البيانات الصحيحة فقط
      const validData = mappedData.filter((_, index) =>
        validationResults[index].isValid
      );

      // 6. Check duplicates
      const duplicateInfo = await this.checkDuplicates(
        validData,
        options.duplicateHandling || 'skip'
      );

      // 7. Bulk insert/update مع optimization
      const insertResult = await this.bulkInsertCustomers(
        validData,
        duplicateInfo,
        options
      );

      // 8. بناء النتيجة النهائية
      const result = this.buildImportResult(
        rawData.length,
        validationResults,
        insertResult,
        Date.now() - startTime
      );

      this.logger.log(`تم الاستيراد بنجاح: ${result.insertedRows} مدرج، ${result.updatedRows} محدث`);
      return result;

    } catch (error) {
      this.logger.error('خطأ في استيراد Excel:', error);
      throw new BadRequestException('فشل في استيراد الملف');
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تطبيق مطابقة الأعمدة
   * ═══════════════════════════════════════════════════════════════
   */
  private applyColumnMapping(
    rawData: any[],
    mapping: ColumnMapping[]
  ): Partial<CustomerData>[] {
    return rawData.map((row, index) => {
      const mappedRow: any = { _rowNumber: index + 2 }; // +2 لأن Excel يبدأ من 1 + header

      mapping.forEach(map => {
        const excelValue = row[map.excelColumn];

        // تطبيق التحويل إذا وجد
        if (excelValue !== undefined && excelValue !== null) {
          mappedRow[map.systemField] = this.transformValue(
            excelValue,
            map.systemField
          );
        }
      });

      return mappedRow;
    });
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تحويل القيم حسب نوع الحقل
   * ═══════════════════════════════════════════════════════════════
   */
  private transformValue(value: any, field: string): any {
    // تنظيف القيمة
    if (typeof value === 'string') {
      value = value.trim();
    }

    // تحويلات خاصة بكل حقل
    switch (field) {
      case 'phone':
        return this.normalizePhoneNumber(value);

      case 'email':
        return value.toLowerCase();

      case 'type':
        return this.normalizeCustomerType(value);

      case 'status':
        return value.toLowerCase();

      case 'budgetMin':
      case 'budgetMax':
        return this.parseNumber(value);

      default:
        return value;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تطبيع رقم الهاتف
   * ═══════════════════════════════════════════════════════════════
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return phone;

    // إزالة المسافات والرموز
    phone = phone.replace(/[\s\-\(\)]/g, '');

    // تحويل 05XXXXXXXX إلى +9665XXXXXXXX
    if (phone.startsWith('05')) {
      phone = '+966' + phone.substring(1);
    }

    // إضافة +966 إذا كان يبدأ بـ 5
    if (phone.startsWith('5') && phone.length === 9) {
      phone = '+966' + phone;
    }

    return phone;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تطبيع نوع العميل
   * ═══════════════════════════════════════════════════════════════
   */
  private normalizeCustomerType(type: string): string {
    if (!type) return type;

    const typeMap: Record<string, string> = {
      'مشتري': 'buyer',
      'buyer': 'buyer',
      'بائع': 'seller',
      'seller': 'seller',
      'مستأجر': 'tenant',
      'tenant': 'tenant',
      'مالك': 'landlord',
      'landlord': 'landlord'
    };

    return typeMap[type.toLowerCase()] || type.toLowerCase();
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تحويل النص إلى رقم
   * ═══════════════════════════════════════════════════════════════
   */
  private parseNumber(value: any): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const num = typeof value === 'string'
      ? parseFloat(value.replace(/,/g, ''))
      : Number(value);

    return isNaN(num) ? undefined : num;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * Validate جميع الصفوف
   * ═══════════════════════════════════════════════════════════════
   */
  private async validateAllRows(
    data: Partial<CustomerData>[]
  ): Promise<ValidationResult[]> {
    return Promise.all(
      data.map(row => this.validateRow(row))
    );
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * Validate صف واحد
   * ═══════════════════════════════════════════════════════════════
   */
  private async validateRow(
    row: Partial<CustomerData>
  ): Promise<ValidationResult> {
    const errors: RowError[] = [];
    const warnings: RowError[] = [];
    const rowNum = (row as any)._rowNumber || 0;

    // 1. Validate Name (مطلوب)
    if (!row.name || row.name.trim().length === 0) {
      errors.push({
        row: rowNum,
        field: 'name',
        error: 'الاسم مطلوب',
        value: row.name,
        severity: 'error'
      });
    } else if (row.name.length < 3) {
      errors.push({
        row: rowNum,
        field: 'name',
        error: 'الاسم يجب أن يكون 3 أحرف على الأقل',
        value: row.name,
        severity: 'error'
      });
    }

    // 2. Validate Phone (مطلوب)
    if (!row.phone) {
      errors.push({
        row: rowNum,
        field: 'phone',
        error: 'رقم الهاتف مطلوب',
        value: row.phone,
        severity: 'error'
      });
    } else if (!this.isValidSaudiPhone(row.phone)) {
      errors.push({
        row: rowNum,
        field: 'phone',
        error: 'رقم الهاتف غير صحيح (يجب أن يكون +9665XXXXXXXX)',
        value: row.phone,
        severity: 'error'
      });
    }

    // 3. Validate Email (اختياري)
    if (row.email && !this.isValidEmail(row.email)) {
      errors.push({
        row: rowNum,
        field: 'email',
        error: 'البريد الإلكتروني غير صحيح',
        value: row.email,
        severity: 'error'
      });
    }

    // 4. Validate Customer Type (مطلوب)
    const validTypes = ['buyer', 'seller', 'tenant', 'landlord'];
    if (!row.type) {
      errors.push({
        row: rowNum,
        field: 'type',
        error: 'نوع العميل مطلوب',
        value: row.type,
        severity: 'error'
      });
    } else if (!validTypes.includes(row.type)) {
      errors.push({
        row: rowNum,
        field: 'type',
        error: `نوع العميل غير صحيح (يجب أن يكون: ${validTypes.join('، ')})`,
        value: row.type,
        severity: 'error'
      });
    }

    // 5. Validate Status (اختياري، default: active)
    const validStatuses = ['active', 'inactive', 'archived'];
    if (row.status && !validStatuses.includes(row.status)) {
      warnings.push({
        row: rowNum,
        field: 'status',
        error: `الحالة غير صحيحة، سيتم استخدام 'active'`,
        value: row.status,
        severity: 'warning'
      });
      row.status = 'active';
    }

    // 6. Validate Budget (اختياري)
    if (row.budgetMin !== undefined) {
      if (row.budgetMin < 0) {
        errors.push({
          row: rowNum,
          field: 'budgetMin',
          error: 'الميزانية الدنيا يجب أن تكون أكبر من أو تساوي صفر',
          value: row.budgetMin,
          severity: 'error'
        });
      }
    }

    if (row.budgetMax !== undefined) {
      if (row.budgetMax < 0) {
        errors.push({
          row: rowNum,
          field: 'budgetMax',
          error: 'الميزانية القصوى يجب أن تكون أكبر من أو تساوي صفر',
          value: row.budgetMax,
          severity: 'error'
        });
      }
    }

    if (row.budgetMin && row.budgetMax && row.budgetMin > row.budgetMax) {
      errors.push({
        row: rowNum,
        field: 'budget',
        error: 'الميزانية الدنيا يجب أن تكون أقل من الميزانية القصوى',
        value: `${row.budgetMin} - ${row.budgetMax}`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * Validation Helpers
   * ═══════════════════════════════════════════════════════════════
   */

  private isValidSaudiPhone(phone: string): boolean {
    // Saudi phone: +9665XXXXXXXX (12 digits total)
    const saudiPhoneRegex = /^\+9665\d{8}$/;
    return saudiPhoneRegex.test(phone);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * فحص التكرار
   * ═══════════════════════════════════════════════════════════════
   */
  private async checkDuplicates(
    data: Partial<CustomerData>[],
    handling: 'skip' | 'update' | 'error'
  ): Promise<Map<string, { isDuplicate: boolean; existingId?: string }>> {
    const phones = data.map(d => d.phone).filter(Boolean);

    // جلب العملاء الموجودين بنفس أرقام الهواتف
    const existingCustomers = await this.customerRepository.find({
      where: { phone: In(phones) },
      select: ['id', 'phone']
    });

    const duplicateMap = new Map<string, { isDuplicate: boolean; existingId?: string }>();

    existingCustomers.forEach(customer => {
      duplicateMap.set(customer.phone, {
        isDuplicate: true,
        existingId: customer.id
      });
    });

    // معالجة التكرار حسب الخيار
    if (handling === 'error' && duplicateMap.size > 0) {
      throw new BadRequestException(
        `تم العثور على ${duplicateMap.size} رقم هاتف مكرر`
      );
    }

    return duplicateMap;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * Bulk Insert مع Optimization
   * ═══════════════════════════════════════════════════════════════
   */
  private async bulkInsertCustomers(
    data: Partial<CustomerData>[],
    duplicateInfo: Map<string, { isDuplicate: boolean; existingId?: string }>,
    options: ImportOptions
  ): Promise<{ inserted: number; updated: number; skipped: number }> {
    const batchSize = options.batchSize || 100;
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    // تقسيم البيانات إلى دفعات
    const batches = this.chunkArray(data, batchSize);
    const totalBatches = batches.length;

    this.logger.log(`بدء معالجة ${data.length} صف في ${totalBatches} دفعة`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // استخدام transaction لكل دفعة
      await this.dataSource.transaction(async (manager) => {
        for (const row of batch) {
          const phone = row.phone!;
          const duplicateEntry = duplicateInfo.get(phone);

          if (duplicateEntry?.isDuplicate) {
            // معالجة التكرار
            if (options.duplicateHandling === 'skip') {
              skipped++;
              continue;
            } else if (options.duplicateHandling === 'update') {
              // تحديث العميل الموجود
              await manager.update(
                Customer,
                { id: duplicateEntry.existingId },
                this.mapToCustomerEntity(row)
              );
              updated++;
            }
          } else {
            // إدراج عميل جديد
            const customer = manager.create(
              Customer,
              this.mapToCustomerEntity(row)
            );
            await manager.save(customer);
            inserted++;
          }
        }
      });

      // تسجيل التقدم
      const progress = Math.round(((i + 1) / totalBatches) * 100);
      this.logger.log(`التقدم: ${progress}% (${i + 1}/${totalBatches} دفعة)`);
    }

    return { inserted, updated, skipped };
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تحويل البيانات إلى Customer Entity
   * ═══════════════════════════════════════════════════════════════
   */
  private mapToCustomerEntity(data: Partial<CustomerData>): Partial<Customer> {
    return {
      name: data.name,
      phone: data.phone,
      email: data.email,
      nationalId: data.nationalId,
      type: data.type as any,
      status: data.status as any || 'active',
      city: data.city,
      address: data.address,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,

      preferredCities: data.preferredCities
        ? data.preferredCities.split(',').map(city => city.trim())
        : undefined,

      preferredPropertyTypes: data.preferredPropertyTypes
        ? data.preferredPropertyTypes.split(',').map(type => type.trim())
        : undefined,
        
      source: data.source,
      assignedStaff: data.assignedStaff,
      notes: data.notes
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * Helper: تقسيم المصفوفة إلى دفعات
   * ═══════════════════════════════════════════════════════════════
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * بناء نتيجة المعاينة (validateOnly)
   * ═══════════════════════════════════════════════════════════════
   */
  private generatePreviewResult(
    data: Partial<CustomerData>[],
    validationResults: ValidationResult[],
    duration: number
  ): ImportResult {
    const preview: CustomerPreview[] = data.map((row, index) => ({
      row: (row as any)._rowNumber || index + 2,
      data: row,
      isValid: validationResults[index].isValid,
      isDuplicate: false, // سيتم فحصه لاحقاً
      errors: [
        ...validationResults[index].errors,
        ...validationResults[index].warnings
      ]
    }));

    const validRows = validationResults.filter(v => v.isValid).length;
    const invalidRows = data.length - validRows;

    const allErrors = validationResults.flatMap(v => v.errors);
    const allWarnings = validationResults.flatMap(v => v.warnings);

    return {
      success: true,
      totalRows: data.length,
      validRows,
      invalidRows,
      insertedRows: 0,
      updatedRows: 0,
      skippedRows: 0,
      errors: allErrors,
      warnings: allWarnings,
      preview,
      duration: Math.round(duration / 1000)
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * بناء النتيجة النهائية للاستيراد
   * ═══════════════════════════════════════════════════════════════
   */
  private buildImportResult(
    totalRows: number,
    validationResults: ValidationResult[],
    insertResult: { inserted: number; updated: number; skipped: number },
    duration: number
  ): ImportResult {
    const validRows = validationResults.filter(v => v.isValid).length;
    const invalidRows = totalRows - validRows;

    const allErrors = validationResults.flatMap(v => v.errors);
    const allWarnings = validationResults.flatMap(v => v.warnings);

    return {
      success: true,
      totalRows,
      validRows,
      invalidRows,
      insertedRows: insertResult.inserted,
      updatedRows: insertResult.updated,
      skippedRows: insertResult.skipped,
      errors: allErrors,
      warnings: allWarnings,
      duration: Math.round(duration / 1000)
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تصدير العملاء إلى Excel
   * ═══════════════════════════════════════════════════════════════
   */
  async exportCustomersToExcel(
    filters: CustomerFilters,
    columns: string[],
    options: ExportOptions = {}
  ): Promise<Buffer> {
    this.logger.log('بدء تصدير العملاء إلى Excel');

    try {
      // 1. جلب العملاء حسب الفلاتر
      const customers = await this.getCustomersWithFilters(filters);
      this.logger.log(`تم جلب ${customers.length} عميل`);

      // 2. تحويل البيانات للتصدير
      const exportData = this.transformCustomersForExport(customers, columns);

      // 3. إنشاء workbook
      const wb = XLSX.utils.book_new();

      // 4. إنشاء worksheet للبيانات
      const ws = XLSX.utils.json_to_sheet(exportData);

      // 5. تطبيق التنسيق (إذا مطلوب)
      if (options.applyFormatting) {
        this.applyExcelFormatting(ws, exportData.length);
      }

      XLSX.utils.book_append_sheet(wb, ws, 'العملاء');

      // 6. إضافة sheet الإحصائيات (إذا مطلوب)
      if (options.includeStatistics) {
        const stats = await this.calculateStatistics(filters);
        const statsWs = this.createStatisticsSheet(stats);
        XLSX.utils.book_append_sheet(wb, statsWs, 'الإحصائيات');
      }

      // 7. توليد buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      this.logger.log('تم التصدير بنجاح');
      return buffer;

    } catch (error) {
      this.logger.error('خطأ في تصدير Excel:', error);
      throw new BadRequestException('فشل في تصدير الملف');
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * جلب العملاء حسب الفلاتر
   * ═══════════════════════════════════════════════════════════════
   */
  private async getCustomersWithFilters(
    filters: CustomerFilters
  ): Promise<Customer[]> {
    const query = this.customerRepository.createQueryBuilder('customer');

    // تطبيق الفلاتر
    if (filters.type && filters.type.length > 0) {
      query.andWhere('customer.type IN (:...types)', { types: filters.type });
    }

    if (filters.status && filters.status.length > 0) {
      query.andWhere('customer.status IN (:...statuses)', { statuses: filters.status });
    }

    if (filters.city) {
      query.andWhere('customer.city = :city', { city: filters.city });
    }

    if (filters.source) {
      query.andWhere('customer.source = :source', { source: filters.source });
    }

    if (filters.dateFrom) {
      query.andWhere('customer.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      query.andWhere('customer.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.search) {
      query.andWhere(
        '(customer.name LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.ids && filters.ids.length > 0) {
      query.andWhere('customer.id IN (:...ids)', { ids: filters.ids });
    }

    return query.getMany();
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تحويل العملاء للتصدير
   * ═══════════════════════════════════════════════════════════════
   */
  private transformCustomersForExport(
    customers: Customer[],
    columns: string[]
  ): any[] {
    const columnLabels: Record<string, string> = {
      name: 'الاسم',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      nationalId: 'الهوية الوطنية',
      type: 'النوع',
      status: 'الحالة',
      city: 'المدينة',
      address: 'العنوان',
      budgetMin: 'الميزانية الدنيا',
      budgetMax: 'الميزانية القصوى',
      preferredCities: 'المدن المفضلة',
      preferredPropertyTypes: 'أنواع العقارات المفضلة',
      source: 'المصدر',
      assignedStaff: 'الموظف المسؤول',
      notes: 'الملاحظات',
      createdAt: 'تاريخ التسجيل'
    };

    return customers.map(customer => {
      const row: any = {};

      columns.forEach(col => {
        const label = columnLabels[col] || col;
        let value = customer[col as keyof Customer];

        // تنسيق القيم
        if (col === 'type') {
          value = this.formatCustomerType(value as string);
        } else if (col === 'status') {
          value = this.formatStatus(value as string);
        } else if (col === 'createdAt' && value) {
          value = new Date(value as string).toLocaleDateString('ar-SA');
        }

        row[label] = value || '-';
      });

      return row;
    });
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تنسيق نوع العميل للعرض
   * ═══════════════════════════════════════════════════════════════
   */
  private formatCustomerType(type: string): string {
    const typeMap: Record<string, string> = {
      'buyer': 'مشتري',
      'seller': 'بائع',
      'tenant': 'مستأجر',
      'landlord': 'مالك'
    };
    return typeMap[type] || type;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تنسيق الحالة للعرض
   * ═══════════════════════════════════════════════════════════════
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'نشط',
      'inactive': 'غير نشط',
      'archived': 'مؤرشف'
    };
    return statusMap[status] || status;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تطبيق التنسيق على Excel
   * ═══════════════════════════════════════════════════════════════
   */
  private applyExcelFormatting(ws: XLSX.WorkSheet, rowCount: number): void {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // تنسيق header (صف أول)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
        fill: { fgColor: { rgb: '0066CC' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    // ألوان متناوبة للصفوف
    for (let row = 1; row <= rowCount; row++) {
      const bgColor = row % 2 === 0 ? 'F5F5F5' : 'FFFFFF';

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          fill: { fgColor: { rgb: bgColor } },
          alignment: { horizontal: 'right' }
        };
      }
    }

    // تعيين عرض الأعمدة
    ws['!cols'] = Array(range.e.c - range.s.c + 1).fill({ wch: 20 });
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * حساب الإحصائيات
   * ═══════════════════════════════════════════════════════════════
   */
  private async calculateStatistics(
    filters: CustomerFilters
  ): Promise<CustomerStatistics> {
    const customers = await this.getCustomersWithFilters(filters);

    const stats: CustomerStatistics = {
      total: customers.length,
      byType: {},
      byStatus: {},
      byCity: {},
      bySource: {}
    };

    customers.forEach(customer => {
      // حسب النوع
      const type = this.formatCustomerType(customer.type);
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // حسب الحالة
      const status = this.formatStatus(customer.status);
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // حسب المدينة
      if (customer.city) {
        stats.byCity[customer.city] = (stats.byCity[customer.city] || 0) + 1;
      }

      // حسب المصدر
      if (customer.source) {
        stats.bySource[customer.source] = (stats.bySource[customer.source] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * إنشاء sheet الإحصائيات
   * ═══════════════════════════════════════════════════════════════
   */
  private createStatisticsSheet(stats: CustomerStatistics): XLSX.WorkSheet {
    const data: any[] = [
      ['إحصائيات العملاء'],
      [],
      ['إجمالي العملاء', stats.total],
      [],
      ['التوزيع حسب النوع'],
      ...Object.entries(stats.byType).map(([type, count]) => [type, count]),
      [],
      ['التوزيع حسب الحالة'],
      ...Object.entries(stats.byStatus).map(([status, count]) => [status, count]),
      [],
      ['التوزيع حسب المدينة'],
      ...Object.entries(stats.byCity).map(([city, count]) => [city, count]),
      [],
      ['التوزيع حسب المصدر'],
      ...Object.entries(stats.bySource).map(([source, count]) => [source, count])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // تنسيق العنوان الرئيسي
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: '0066CC' } },
        alignment: { horizontal: 'center' }
      };
    }

    ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

    return ws;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * جلب قائمة القوالب المتاحة
   * ═══════════════════════════════════════════════════════════════
   */
  async getTemplates(): Promise<TemplateInfo[]> {
    // القوالب المحددة مسبقاً
    return [
      {
        id: 'basic',
        name: 'القالب الأساسي',
        nameEn: 'basic-template',
        description: 'قالب شامل يحتوي على جميع الحقول الأساسية',
        type: 'basic',
        columnsCount: 13,
        fields: [
          { key: 'name', label: 'الاسم', required: true, type: 'text', example: 'أحمد محمد' },
          { key: 'phone', label: 'رقم الهاتف', required: true, type: 'phone', example: '0501234567' },
          { key: 'email', label: 'البريد الإلكتروني', required: false, type: 'email', example: 'ahmed@example.com' },
          // ... المزيد من الحقول
        ]
      },
      // ... المزيد من القوالب
    ];
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تحميل قالب محدد
   * ═══════════════════════════════════════════════════════════════
   */
  async downloadTemplate(templateId: string): Promise<Buffer> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      throw new BadRequestException('القالب غير موجود');
    }

    // إنشاء Excel قالب فارغ
    const wb = XLSX.utils.book_new();

    const headers = template.fields.map(f => f.label);
    const examples = template.fields.map(f => f.example || '');

    const ws = XLSX.utils.aoa_to_sheet([headers, examples]);

    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
