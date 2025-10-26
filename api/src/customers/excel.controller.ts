/**
 * ═══════════════════════════════════════════════════════════════
 * Excel Controller - معالجة Excel للعملاء
 * ═══════════════════════════════════════════════════════════════
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExcelService } from './excel.service';
import { ImportCustomersDto, PreviewImportDto } from './dto/import-customers.dto';
import { ExportCustomersDto, ExportTemplateDto } from './dto/export-customers.dto';

@Controller('customers/excel')
export class ExcelController {
  private readonly logger = new Logger(ExcelController.name);

  constructor(private readonly excelService: ExcelService) {}

  /**
   * ═══════════════════════════════════════════════════════════════
   * استيراد العملاء من Excel
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route POST /customers/excel/import
   * @body ImportCustomersDto
   * @file Excel file
   * @returns ImportResult
   */
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCustomers(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportCustomersDto
  ) {
    this.logger.log('تلقي طلب استيراد Excel');

    // التحقق من وجود الملف
    if (!file) {
      throw new BadRequestException('الملف مطلوب');
    }

    // التحقق من نوع الملف
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'نوع الملف غير مدعوم. يرجى استخدام .xlsx أو .xls أو .csv'
      );
    }

    // التحقق من حجم الملف (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('حجم الملف يجب أن لا يتجاوز 10MB');
    }

    try {
      const result = await this.excelService.importCustomersFromExcel(
        file,
        dto.mapping,
        {
          duplicateHandling: dto.duplicateHandling || 'skip',
          validateOnly: dto.validateOnly || false,
          batchSize: dto.batchSize || 100,
          skipInvalidRows: dto.skipInvalidRows || false
        }
      );

      this.logger.log(`تم الاستيراد: ${result.insertedRows} مدرج، ${result.updatedRows} محدث`);

      return {
        success: true,
        message: 'تم استيراد الملف بنجاح',
        data: result
      };
    } catch (error) {
      this.logger.error('خطأ في الاستيراد:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * معاينة الاستيراد (بدون حفظ)
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route POST /customers/excel/preview
   * @body PreviewImportDto
   * @file Excel file
   * @returns ImportResult (preview only)
   */
  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  async previewImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PreviewImportDto
  ) {
    this.logger.log('تلقي طلب معاينة استيراد Excel');

    if (!file) {
      throw new BadRequestException('الملف مطلوب');
    }

    try {
      const result = await this.excelService.importCustomersFromExcel(
        file,
        dto.mapping,
        {
          validateOnly: true,
          duplicateHandling: 'skip'
        }
      );

      // إرجاع فقط عدد محدود من الصفوف للمعاينة
      const previewRows = dto.previewRows || 10;
      if (result.preview && result.preview.length > previewRows) {
        result.preview = result.preview.slice(0, previewRows);
      }

      return {
        success: true,
        message: 'تم إنشاء المعاينة بنجاح',
        data: result
      };
    } catch (error) {
      this.logger.error('خطأ في المعاينة:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تصدير العملاء إلى Excel
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route POST /customers/excel/export
   * @body ExportCustomersDto
   * @returns Excel file
   */
  @Post('export')
  async exportCustomers(
    @Body() dto: ExportCustomersDto,
    @Res() res: Response
  ) {
    this.logger.log('تلقي طلب تصدير Excel');

    try {
      const buffer = await this.excelService.exportCustomersToExcel(
        dto.filters || {},
        dto.columns,
        {
          includeStatistics: dto.includeStatistics || false,
          applyFormatting: dto.applyFormatting !== false, // default: true
          includeHeader: dto.includeHeader !== false, // default: true
          fileName: dto.fileName
        }
      );

      // تحديد اسم الملف
      const fileName = dto.fileName || `customers-${Date.now()}.xlsx`;

      // إعداد response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );
      res.setHeader('Content-Length', buffer.length);

      this.logger.log(`تم التصدير بنجاح: ${fileName}`);

      // إرسال الملف
      return res.send(buffer);
    } catch (error) {
      this.logger.error('خطأ في التصدير:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * جلب قائمة القوالب المتاحة
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route GET /customers/excel/templates
   * @returns TemplateInfo[]
   */
  @Get('templates')
  async getTemplates() {
    this.logger.log('تلقي طلب جلب القوالب');

    try {
      const templates = await this.excelService.getTemplates();

      return {
        success: true,
        message: 'تم جلب القوالب بنجاح',
        data: templates
      };
    } catch (error) {
      this.logger.error('خطأ في جلب القوالب:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تحميل قالب محدد
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route GET /customers/excel/templates/:id/download
   * @param id - معرف القالب
   * @returns Excel template file
   */
  @Get('templates/:id/download')
  async downloadTemplate(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    this.logger.log(`تلقي طلب تحميل القالب: ${id}`);

    try {
      const buffer = await this.excelService.downloadTemplate(id);

      const fileName = `template-${id}-${Date.now()}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );
      res.setHeader('Content-Length', buffer.length);

      this.logger.log(`تم تحميل القالب بنجاح: ${fileName}`);

      return res.send(buffer);
    } catch (error) {
      this.logger.error('خطأ في تحميل القالب:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * تصدير قالب مخصص (من frontend)
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route POST /customers/excel/templates/export
   * @body ExportTemplateDto
   * @returns Template file
   */
  @Post('templates/export')
  async exportTemplate(
    @Body() dto: ExportTemplateDto,
    @Res() res: Response
  ) {
    this.logger.log(`تلقي طلب تصدير قالب مخصص: ${dto.templateId}`);

    try {
      const buffer = await this.excelService.downloadTemplate(dto.templateId);

      const format = dto.format || 'xlsx';
      const fileName = `template-${dto.templateId}-${Date.now()}.${format}`;

      if (format === 'xlsx') {
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
      } else {
        res.setHeader('Content-Type', 'text/csv');
      }

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );

      this.logger.log(`تم تصدير القالب بنجاح: ${fileName}`);

      return res.send(buffer);
    } catch (error) {
      this.logger.error('خطأ في تصدير القالب:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * التحقق من صحة الملف قبل الرفع
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route POST /customers/excel/validate-file
   * @file Excel file
   * @returns File validation result
   */
  @Post('validate-file')
  @UseInterceptors(FileInterceptor('file'))
  async validateFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('تلقي طلب التحقق من الملف');

    if (!file) {
      throw new BadRequestException('الملف مطلوب');
    }

    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    const isValidType = allowedMimeTypes.includes(file.mimetype);
    const isValidSize = file.size <= maxSize;

    return {
      success: isValidType && isValidSize,
      isValidType,
      isValidSize,
      fileInfo: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
      },
      message: isValidType && isValidSize
        ? 'الملف صالح للرفع'
        : !isValidType
        ? 'نوع الملف غير مدعوم'
        : 'حجم الملف يتجاوز الحد المسموح (10MB)'
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * الحصول على معلومات الاستيراد (statistics)
   * ═══════════════════════════════════════════════════════════════
   * 
   * @route GET /customers/excel/import-stats
   * @returns Import statistics
   */
  @Get('import-stats')
  async getImportStats() {
    this.logger.log('تلقي طلب إحصائيات الاستيراد');

    // في التطبيق الحقيقي، يمكن حفظ هذه الإحصائيات في قاعدة البيانات
    // هنا نرجع بيانات تجريبية للتوضيح
    return {
      success: true,
      data: {
        totalImports: 0,
        totalRowsImported: 0,
        lastImportDate: null,
        averageImportTime: 0,
        errorRate: 0
      },
      message: 'جاري تطوير هذه الميزة'
    };
  }
}
