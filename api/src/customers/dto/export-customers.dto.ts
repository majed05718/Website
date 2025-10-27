/**
 * ═══════════════════════════════════════════════════════════════
 * Export Customers DTOs - تصدير العملاء
 * ═══════════════════════════════════════════════════════════════
 */

import { 
  IsArray, 
  IsBoolean, 
  IsEnum, 
  IsOptional, 
  IsString,
  IsDateString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO لفلاتر العملاء
 */
export class CustomerFiltersDto {
  @IsOptional()
  @IsArray()
  @IsEnum(['buyer', 'seller', 'tenant', 'landlord'], { each: true })
  type?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(['active', 'inactive', 'archived'], { each: true })
  status?: string[];

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}

/**
 * DTO الرئيسي لتصدير العملاء
 */
export class ExportCustomersDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerFiltersDto)
  filters?: CustomerFiltersDto;

  @IsArray({ message: 'الأعمدة يجب أن تكون مصفوفة' })
  @IsString({ each: true })
  columns: string[];

  @IsOptional()
  @IsBoolean()
  includeStatistics?: boolean;

  @IsOptional()
  @IsBoolean()
  applyFormatting?: boolean;

  @IsOptional()
  @IsBoolean()
  includeHeader?: boolean;

  @IsOptional()
  @IsString()
  fileName?: string;
}

/**
 * DTO لتصدير قالب محدد
 */
export class ExportTemplateDto {
  @IsString({ message: 'معرف القالب مطلوب' })
  templateId: string;

  @IsOptional()
  @IsBoolean()
  includeExamples?: boolean;

  @IsOptional()
  @IsBoolean()
  includeInstructions?: boolean;

  @IsOptional()
  @IsEnum(['xlsx', 'csv'], { message: 'التنسيق يجب أن يكون xlsx أو csv' })
  format?: 'xlsx' | 'csv';
}
