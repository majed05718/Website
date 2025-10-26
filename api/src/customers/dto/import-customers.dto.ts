/**
 * ═══════════════════════════════════════════════════════════════
 * Import Customers DTOs - استيراد العملاء
 * ═══════════════════════════════════════════════════════════════
 */

import { 
  IsArray, 
  IsBoolean, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString,
  ValidateNested,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO لمطابقة الأعمدة
 */
export class ColumnMappingDto {
  @IsNotEmpty({ message: 'اسم عمود Excel مطلوب' })
  @IsString()
  excelColumn: string;

  @IsNotEmpty({ message: 'اسم حقل النظام مطلوب' })
  @IsString()
  systemField: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  transform?: string;
}

/**
 * DTO الرئيسي لاستيراد العملاء
 */
export class ImportCustomersDto {
  @IsArray({ message: 'مطابقة الأعمدة يجب أن تكون مصفوفة' })
  @ValidateNested({ each: true })
  @Type(() => ColumnMappingDto)
  mapping: ColumnMappingDto[];

  @IsOptional()
  @IsEnum(['skip', 'update', 'error'], { 
    message: 'معالجة التكرار يجب أن تكون: skip, update, أو error' 
  })
  duplicateHandling?: 'skip' | 'update' | 'error';

  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(10, { message: 'حجم الدفعة يجب أن يكون على الأقل 10' })
  @Max(1000, { message: 'حجم الدفعة يجب أن لا يتجاوز 1000' })
  batchSize?: number;

  @IsOptional()
  @IsBoolean()
  skipInvalidRows?: boolean;
}

/**
 * DTO لمعاينة الاستيراد
 */
export class PreviewImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnMappingDto)
  mapping: ColumnMappingDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  previewRows?: number; // عدد الصفوف للمعاينة (default: 10)
}
